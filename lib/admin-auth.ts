import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-constants";

type AdminSessionPayload = {
  sub: string;
  email: string;
  role: "ADMIN";
  /** Fingerprint of the password hash at login time — changing the password revokes existing sessions. */
  pwd: string;
  exp: number;
};

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be set in production — admin sessions cannot use the dev fallback.");
  }
  return "dev-admin-session-secret-change-me";
}

export function passwordFingerprint(passwordHash: string) {
  return crypto.createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function sign(value: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function hashPassword(rawPassword: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(rawPassword, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

export function verifyPassword(rawPassword: string, storedHash: string) {
  const [algorithm, iterationsText, salt, hash] = storedHash.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterationsText || !salt || !hash) return false;
  const iterations = Number(iterationsText);
  if (!Number.isFinite(iterations)) return false;
  const candidate = crypto.pbkdf2Sync(rawPassword, salt, iterations, 32, "sha256").toString("hex");
  return safeEqual(candidate, hash);
}

export function createAdminToken(payload: Omit<AdminSessionPayload, "exp" | "pwd">, passwordHash: string) {
  const body: AdminSessionPayload = {
    ...payload,
    pwd: passwordFingerprint(passwordHash),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminToken(token: string | undefined): AdminSessionPayload | null {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AdminSessionPayload;
    if (payload.role !== "ADMIN") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const payload = verifyAdminToken(token);
  if (!payload) return null;
  const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
  if (!admin || admin.role !== "ADMIN") return null;
  if (payload.pwd !== passwordFingerprint(admin.passwordHash)) return null;
  return admin;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export function setAdminSessionCookie(token: string) {
  cookies().set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https"), // 仅 https 站点加 Secure(http/IP 部署下也能保持登录)
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearAdminSessionCookie() {
  cookies().delete(ADMIN_SESSION_COOKIE);
}
