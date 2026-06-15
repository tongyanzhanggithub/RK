import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif"
};

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to the admin again." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Only JPG / PNG / WebP / GIF / AVIF images are supported." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large; keep it under 5MB." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

  // Production (Vercel): persist to Vercel Blob when the token is configured.
  // The local filesystem on serverless platforms is read-only / ephemeral.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${filename}`, bytes, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      return NextResponse.json({ url: blob.url });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to upload to cloud storage." },
        { status: 500 }
      );
    }
  }

  // Local development fallback: write to public/uploads.
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), bytes);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save the image." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: `/uploads/${filename}` });
}
