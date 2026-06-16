"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getStoreProducts } from "@/lib/product-store";

export type QuoteRequestState = {
  error?: string;
  ok?: boolean;
};

const schema = z.object({
  contactName: z.string().min(2).max(120),
  company: z.string().max(160).optional(),
  country: z.string().min(2).max(100),
  email: z.string().email().max(200),
  whatsapp: z.string().max(50).optional(),
  message: z.string().max(3000).optional(),
  items: z.array(z.object({ slug: z.string().min(1), quantity: z.coerce.number().int().min(1).max(99999) })).min(1)
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function submitQuoteRequest(
  _prev: QuoteRequestState,
  formData: FormData
): Promise<QuoteRequestState> {
  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse(text(formData, "items") || "[]");
  } catch {
    return { error: "Quote list could not be read. Please try again." };
  }

  const parsed = schema.safeParse({
    contactName: text(formData, "contactName"),
    company: text(formData, "company") || undefined,
    country: text(formData, "country"),
    email: text(formData, "email").toLowerCase(),
    whatsapp: text(formData, "whatsapp") || undefined,
    message: text(formData, "message") || undefined,
    items: itemsRaw
  });

  if (!parsed.success) {
    return { error: "Please fill in name, country, a valid email and add at least one product." };
  }

  // Resolve products to snapshot name/sku at request time.
  const products = await getStoreProducts();
  const lineItems = parsed.data.items
    .map((item) => {
      const product = products.find((candidate) => candidate.slug === item.slug);
      if (!product) return null;
      return { slug: product.slug, name: product.name, sku: product.sku || "", quantity: item.quantity };
    })
    .filter(Boolean) as { slug: string; name: string; sku: string; quantity: number }[];

  if (lineItems.length === 0) {
    return { error: "None of the products could be found. Please refresh and try again." };
  }

  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  await prisma.quoteRequest.create({
    data: {
      contactName: parsed.data.contactName,
      company: parsed.data.company || null,
      country: parsed.data.country,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp || null,
      items: JSON.stringify(lineItems),
      itemCount: lineItems.length,
      totalQuantity,
      message: parsed.data.message || null
    }
  });

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: `New quote request: ${parsed.data.company || parsed.data.contactName} (${lineItems.length} items)`,
      text: [
        `Contact: ${parsed.data.contactName}`,
        parsed.data.company ? `Company: ${parsed.data.company}` : "",
        `Country: ${parsed.data.country}`,
        `Email: ${parsed.data.email}`,
        parsed.data.whatsapp ? `WhatsApp: ${parsed.data.whatsapp}` : "",
        "",
        "Items:",
        ...lineItems.map((item) => `  - ${item.name} (${item.sku}) x${item.quantity}`),
        `  Total quantity: ${totalQuantity}`,
        parsed.data.message ? `\nMessage: ${parsed.data.message}` : ""
      ]
        .filter(Boolean)
        .join("\n")
    }).catch(() => {
      // Non-fatal: request is already saved.
    });
  }

  return { ok: true };
}
