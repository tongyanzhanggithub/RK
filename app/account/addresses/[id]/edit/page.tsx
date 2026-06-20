import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateAddress } from "@/app/account/address-actions";
import { AddressForm } from "@/app/account/address-form";
import { requireCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Address",
  description: "Edit a shipping address."
};

export default async function EditAddressPage({ params }: { params: { id: string } }) {
  const customer = await requireCustomer();
  const address = await prisma.customerAddress.findFirst({
    where: { id: params.id, customerId: customer.id }
  });
  if (!address) notFound();

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase text-brand">My account</p>
            <h1 className="text-4xl font-black">Edit address</h1>
          </div>
          <Link href="/account/addresses" className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel">
            Back to addresses
          </Link>
        </div>
        <AddressForm action={updateAddress.bind(null, address.id)} address={address} submitLabel="Save address" />
      </div>
    </main>
  );
}
