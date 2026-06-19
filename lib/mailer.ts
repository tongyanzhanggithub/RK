import nodemailer from "nodemailer";

// SMTP config via env vars. Leave SMTP_HOST unset to disable email (dev default).
function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

type MailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail(options: MailOptions) {
  const transport = createTransport();
  if (!transport) return; // silently skip when SMTP not configured

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@partavio.com";
  await transport.sendMail({ from, ...options });
}
