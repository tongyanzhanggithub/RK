"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/admin-auth";
import { clearCustomerSessionCookie, createCustomerToken, setCustomerSessionCookie } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export type AuthState = { error?: string };

// Simple in-memory brute-force guard for login (single instance).
const MAX_FAILS = 6;
const LOCK_MS = 10 * 60 * 1000;
const fails = new Map<string, { count: number; until: number }>();

function locked(email: string) {
  const e = fails.get(email);
  if (!e) return false;
  if (e.until > Date.now()) return true;
  if (e.until > 0) fails.delete(email);
  return false;
}
function recordFail(email: string) {
  const e = fails.get(email) || { count: 0, until: 0 };
  e.count += 1;
  if (e.count >= MAX_FAILS) {
    e.until = Date.now() + LOCK_MS;
    e.count = 0;
  }
  fails.set(email, e);
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  country: z.string().max(100).optional(),
  password: z.string().min(8).max(200)
});

export async function registerCustomer(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email").toLowerCase(),
    country: text(formData, "country") || undefined,
    password: text(formData, "password")
  });
  if (!parsed.success) {
    return { error: "Please enter your name, a valid email and a password of at least 8 characters." };
  }
  const { name, email, country, password } = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { email } });
  let customer;
  if (existing) {
    if (existing.passwordHash) {
      return { error: "An account with this email already exists. Please sign in instead." };
    }
    // Claim a guest profile (created from a past order) by setting a password.
    customer = await prisma.customer.update({
      where: { id: existing.id },
      data: {
        passwordHash: hashPassword(password),
        name: existing.name || name,
        country: existing.country || country || null
      }
    });
  } else {
    customer = await prisma.customer.create({
      data: {
        email,
        name,
        country: country || null,
        passwordHash: hashPassword(password),
        status: "ACTIVE",
        role: "CUSTOMER",
        tags: "[]"
      }
    });
  }

  setCustomerSessionCookie(createCustomerToken({ sub: customer.id, email: customer.email }, customer.passwordHash!));
  redirect("/account");
}

export async function loginCustomer(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  if (!email || !password) return { error: "Please enter your email and password." };
  if (locked(email)) return { error: "Too many attempts. Please try again in a few minutes." };

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.passwordHash || !verifyPassword(password, customer.passwordHash)) {
    recordFail(email);
    return { error: "Invalid email or password." };
  }
  if (customer.status === "BLOCKED") {
    return { error: "This account is not active. Please contact us." };
  }

  fails.delete(email);
  setCustomerSessionCookie(createCustomerToken({ sub: customer.id, email: customer.email }, customer.passwordHash));
  redirect("/account");
}

export async function logoutCustomer() {
  clearCustomerSessionCookie();
  redirect("/account/login");
}

// ---- Password reset ----

const RESET_TTL_MS = 30 * 60 * 1000;
const RESET_COOLDOWN_MS = 2 * 60 * 1000;
const resetRequests = new Map<string, number>();
const GENERIC_RESET =
  "If an account exists for that email, a reset link has been sent. The link expires in 30 minutes.";

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestCustomerReset(
  _prev: { error?: string; message?: string },
  formData: FormData
): Promise<{ error?: string; message?: string }> {
  const parsed = z.string().email().safeParse(text(formData, "email").toLowerCase());
  if (!parsed.success) return { error: "Please enter a valid email address." };
  const email = parsed.data;

  const last = resetRequests.get(email) || 0;
  if (Date.now() - last < RESET_COOLDOWN_MS) return { message: GENERIC_RESET };
  resetRequests.set(email, Date.now());

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (customer && customer.passwordHash) {
    const token = crypto.randomBytes(32).toString("base64url");
    await prisma.customer.update({
      where: { id: customer.id },
      data: { resetTokenHash: hashResetToken(token), resetTokenExpiresAt: new Date(Date.now() + RESET_TTL_MS) }
    });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";
    const resetUrl = `${siteUrl}/account/reset-password?token=${token}`;
    if (process.env.SMTP_HOST) {
      await sendMail({
        to: email,
        subject: "Reset your Partavio password",
        text: [
          "A password reset was requested for your account.",
          "",
          `Reset link (valid for 30 minutes): ${resetUrl}`,
          "",
          "If you didn't request this, you can ignore this email."
        ].join("\n")
      }).catch(() => {});
    } else if (process.env.NODE_ENV !== "production") {
      console.log(`[customer-reset] ${email}: ${resetUrl}`);
    }
  }

  return { message: GENERIC_RESET };
}

const resetSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: z.string().min(8).max(200),
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });

export async function resetCustomerPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse({
    token: text(formData, "token"),
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword")
  });
  if (!parsed.success) return { error: "Passwords must match and be at least 8 characters." };

  const customer = await prisma.customer.findFirst({
    where: { resetTokenHash: hashResetToken(parsed.data.token) }
  });
  if (!customer || !customer.resetTokenExpiresAt || customer.resetTokenExpiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash: hashPassword(parsed.data.password),
      resetTokenHash: null,
      resetTokenExpiresAt: null
    }
  });
  fails.delete(customer.email);
  redirect("/account/login?reset=1");
}
