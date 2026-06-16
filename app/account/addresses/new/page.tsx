import type { Metadata } from "next";
import Link from "next/link";
import { createAddress } from "@/app/account/address-actions";
import { AddressForm } from "@/app/account/address-form";
import { requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Address",
  description: "Add a shipping address."
};

export default async function NewAddressPage() {
  await requireCustomer();
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase text-safety">My account</p>
            <h1 className="text-4xl font-black">Add address</h1>
          </div>
          <Link href="/account/addresses" className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel">
            Back to addresses
          </Link>
        </div>
        <AddressForm action={createAddress} submitLabel="Save address" />
      </div>
    </main>
  );
}
