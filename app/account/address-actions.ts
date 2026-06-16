"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

export type AddressFormState = { error?: string };

const addressSchema = z.object({
  recipient: z.string().min(2).max(120),
  phone: z.string().max(40).optional(),
  country: z.string().min(2).max(100),
  city: z.string().max(100).optional(),
  line1: z.string().min(3).max(300),
  postalCode: z.string().max(40).optional(),
  isDefault: z.boolean()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function parseAddress(formData: FormData) {
  const parsed = addressSchema.safeParse({
    recipient: text(formData, "recipient"),
    phone: text(formData, "phone") || undefined,
    country: text(formData, "country"),
    city: text(formData, "city") || undefined,
    line1: text(formData, "line1"),
    postalCode: text(formData, "postalCode") || undefined,
    isDefault: formData.get("isDefault") === "on"
  });
  if (!parsed.success) {
    return { error: "Please fill in recipient, country and the full address." };
  }
  return { data: parsed.data };
}

export async function createAddress(_prev: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const customer = await requireCustomer();
  const result = parseAddress(formData);
  if ("error" in result) return { error: result.error };
  const data = result.data;

  const count = await prisma.customerAddress.count({ where: { customerId: customer.id } });
  const makeDefault = data.isDefault || count === 0; // first address is always default

  try {
    await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.customerAddress.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
      }
      await tx.customerAddress.create({
        data: {
          customerId: customer.id,
          recipient: data.recipient,
          phone: data.phone ?? null,
          country: data.country,
          city: data.city ?? null,
          line1: data.line1,
          postalCode: data.postalCode ?? null,
          isDefault: makeDefault
        }
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to save the address." };
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function updateAddress(
  addressId: string,
  _prev: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const customer = await requireCustomer();
  const owned = await prisma.customerAddress.findFirst({ where: { id: addressId, customerId: customer.id } });
  if (!owned) return { error: "Address not found." };
  const result = parseAddress(formData);
  if ("error" in result) return { error: result.error };
  const data = result.data;

  try {
    await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.customerAddress.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
      }
      await tx.customerAddress.update({
        where: { id: addressId },
        data: {
          recipient: data.recipient,
          phone: data.phone ?? null,
          country: data.country,
          city: data.city ?? null,
          line1: data.line1,
          postalCode: data.postalCode ?? null,
          // keep default if it already was and user didn't uncheck via a new default elsewhere
          isDefault: data.isDefault || owned.isDefault
        }
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update the address." };
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function setDefaultAddress(addressId: string) {
  const customer = await requireCustomer();
  const owned = await prisma.customerAddress.findFirst({ where: { id: addressId, customerId: customer.id } });
  if (!owned) redirect("/account/addresses");
  await prisma.$transaction([
    prisma.customerAddress.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } }),
    prisma.customerAddress.update({ where: { id: addressId }, data: { isDefault: true } })
  ]);
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function deleteAddress(addressId: string) {
  const customer = await requireCustomer();
  const owned = await prisma.customerAddress.findFirst({ where: { id: addressId, customerId: customer.id } });
  if (!owned) redirect("/account/addresses");
  await prisma.customerAddress.delete({ where: { id: addressId } });
  // If we removed the default, promote the most recent remaining address.
  if (owned.isDefault) {
    const next = await prisma.customerAddress.findFirst({
      where: { customerId: customer.id },
      orderBy: { updatedAt: "desc" }
    });
    if (next) await prisma.customerAddress.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}
