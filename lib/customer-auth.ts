import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { passwordFingerprint } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const CUSTOMER_SESSION_COOKIE = "rk-customer-session";

type CustomerSessionPayload = {
  sub: string;
  email: string;
  pwd: string; // password-hash fingerprint — changing the password revokes sessions
  exp: number;
};

function sessionSecret() {
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CUSTOMER_SESSION_SECRET (or ADMIN_SESSION_SECRET) must be set in production.");
  }
  return "dev-customer-session-secret-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createCustomerToken(payload: { sub: string; email: string }, passwordHash: string) {
  const body: CustomerSessionPayload = {
    ...payload,
    pwd: passwordFingerprint(passwordHash),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function verifyToken(token: string | undefined): CustomerSessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as CustomerSessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentCustomer() {
  const token = cookies().get(CUSTOMER_SESSION_COOKIE)?.value;
  const payload = verifyToken(token);
  if (!payload) return null;
  const customer = await prisma.customer.findUnique({ where: { id: payload.sub } });
  if (!customer || !customer.passwordHash) return null;
  if (customer.status === "BLOCKED") return null;
  if (payload.pwd !== passwordFingerprint(customer.passwordHash)) return null;
  return customer;
}

export async function requireCustomer() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login");
  return customer;
}

export function setCustomerSessionCookie(token: string) {
  cookies().set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https"), // 仅 https 站点加 Secure(http/IP 部署下也能保持登录)
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearCustomerSessionCookie() {
  cookies().delete(CUSTOMER_SESSION_COOKIE);
}
