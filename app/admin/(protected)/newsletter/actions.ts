"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export type NewsletterFormState = {
  error?: string;
  sent?: number;
};

const campaignSchema = z.object({
  subject: z.string().min(3).max(200),
  body: z.string().min(10).max(20000)
});

// Render plain-text body into a minimal branded HTML email.
function bodyToHtml(body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px;line-height:1.6">${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a;max-width:600px;margin:0 auto">${paragraphs}<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0"><p style="font-size:12px;color:#888">Partavio · Small Engine Parts. You receive this because you subscribed to our updates.</p></div>`;
}

export async function sendCampaign(_prev: NewsletterFormState, formData: FormData): Promise<NewsletterFormState> {
  const admin = await requireAdmin();

  const parsed = campaignSchema.safeParse({
    subject: String(formData.get("subject") || "").trim(),
    body: String(formData.get("body") || "").trim()
  });
  if (!parsed.success) {
    return { error: "请填写邮件主题（≥3字）与正文（≥10字）。" };
  }

  if (!process.env.SMTP_HOST) {
    return { error: "未配置 SMTP（SMTP_HOST 等环境变量），无法群发。请先在服务器配置邮件发送。" };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true }
  });
  if (subscribers.length === 0) {
    return { error: "暂无有效订阅者。" };
  }

  const html = bodyToHtml(parsed.data.body);
  let sent = 0;
  // Send individually so one bad address doesn't abort the batch and recipients
  // never see each other (no shared To/CC). Sequential keeps SMTP rate gentle.
  for (const { email } of subscribers) {
    try {
      await sendMail({ to: email, subject: parsed.data.subject, text: parsed.data.body, html });
      sent++;
    } catch {
      // Skip failed recipient; continue the batch.
    }
  }

  await logAdminAction(admin, "newsletter.send", `${parsed.data.subject} → ${sent}/${subscribers.length}`);
  revalidatePath("/admin/newsletter");
  return { sent };
}

export async function toggleSubscriber(id: string, isActive: boolean) {
  const admin = await requireAdmin();
  const sub = await prisma.newsletterSubscriber.update({
    where: { id },
    data: { isActive }
  });
  await logAdminAction(admin, "newsletter.toggle", `${sub.email} → ${isActive ? "active" : "unsubscribed"}`);
  revalidatePath("/admin/newsletter");
}
