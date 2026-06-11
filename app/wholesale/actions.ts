"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export type WholesaleApplicationState = {
  error?: string;
};

const applicationSchema = z.object({
  companyName: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  country: z.string().min(2).max(100),
  whatsapp: z.string().min(5).max(50),
  email: z.string().email().max(200),
  businessType: z.enum(["Repair Shop", "Distributor", "Retailer", "Online Seller", "Fleet or Rental", "Other"]),
  productInterest: z.string().min(3).max(1000),
  estimatedMonthlyQuantity: z.coerce.number().int().positive().max(100000).optional(),
  message: z.string().max(3000).optional()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function productInterests(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export async function submitWholesaleApplication(
  _previousState: WholesaleApplicationState,
  formData: FormData
): Promise<WholesaleApplicationState> {
  const quantityText = text(formData, "estimatedMonthlyQuantity");
  const parsed = applicationSchema.safeParse({
    companyName: text(formData, "companyName"),
    contactName: text(formData, "contactName"),
    country: text(formData, "country"),
    whatsapp: text(formData, "whatsapp"),
    email: text(formData, "email").toLowerCase(),
    businessType: text(formData, "businessType"),
    productInterest: text(formData, "productInterest"),
    estimatedMonthlyQuantity: quantityText ? quantityText : undefined,
    message: text(formData, "message") || undefined
  });

  if (!parsed.success) {
    return { error: "Please check the required fields, email address and estimated monthly quantity." };
  }

  const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email } });

  await prisma.wholesaleApplication.create({
    data: {
      customerId: customer?.id,
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName,
      country: parsed.data.country,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email,
      businessType: parsed.data.businessType,
      productInterest: JSON.stringify(productInterests(parsed.data.productInterest)),
      estimatedMonthlyQuantity: parsed.data.estimatedMonthlyQuantity,
      message: parsed.data.message || null
    }
  });

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    const qty = parsed.data.estimatedMonthlyQuantity ?? "—";
    await sendMail({
      to: adminEmail,
      subject: `New wholesale application: ${parsed.data.companyName}`,
      text: [
        `Company: ${parsed.data.companyName}`,
        `Contact: ${parsed.data.contactName}`,
        `Country: ${parsed.data.country}`,
        `Business type: ${parsed.data.businessType}`,
        `WhatsApp: ${parsed.data.whatsapp}`,
        `Email: ${parsed.data.email}`,
        `Products: ${parsed.data.productInterest}`,
        `Est. monthly qty: ${qty}`,
        parsed.data.message ? `Message: ${parsed.data.message}` : ""
      ]
        .filter(Boolean)
        .join("\n")
    }).catch(() => {
      // Non-fatal: application is already saved; mail failure should not block the user.
    });
  }

  redirect("/wholesale?submitted=1");
}
