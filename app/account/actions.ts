"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/admin-auth";
import { clearCustomerSessionCookie, createCustomerToken, setCustomerSessionCookie } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

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
