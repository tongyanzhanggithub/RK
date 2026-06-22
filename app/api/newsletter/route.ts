import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCES = new Set(["footer", "popup", "checkout"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields; humans never see them.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 422 });
  }

  const name = String(body.name || "").trim().slice(0, 120) || null;
  const locale = String(body.locale || "").trim().slice(0, 8) || null;
  const sourceRaw = String(body.source || "footer").trim();
  const source = SOURCES.has(sourceRaw) ? sourceRaw : "footer";

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      // Re-subscribe a previously unsubscribed address; keep original source/name.
      update: { isActive: true },
      create: { email, name, locale, source }
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
