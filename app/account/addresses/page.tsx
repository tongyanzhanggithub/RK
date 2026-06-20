import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus, Star } from "lucide-react";
import { deleteAddress, setDefaultAddress } from "@/app/account/address-actions";
import { requireCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping Addresses",
  description: "Manage your saved shipping addresses."
};

export default async function AddressesPage() {
  const customer = await requireCustomer();
  const addresses = await prisma.customerAddress.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
  });

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase text-brand">My account</p>
            <h1 className="text-4xl font-black">Shipping addresses</h1>
            <p className="mt-2 text-steel">Save the addresses you ship to — the default one is used first at checkout.</p>
          </div>
          <Link href="/account" className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel">
            Back to account
          </Link>
        </div>

        <div className="mt-6">
          <Link href="/account/addresses/new" className="inline-flex h-11 items-center gap-2 bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
            <Plus size={18} /> Add address
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="mt-6 border border-line bg-white p-8 text-center">
            <MapPin className="mx-auto text-steel" size={40} />
            <p className="mt-3 font-black">No saved addresses yet</p>
            <p className="mt-1 text-steel">Add a shipping address to speed up checkout.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {addresses.map((a) => (
              <article key={a.id} className="border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-black">
                      {a.recipient}
                      {a.isDefault && (
                        <span className="inline-flex items-center gap-1 bg-navy px-2 py-0.5 text-xs font-black text-white">
                          <Star size={12} /> Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-steel">
                      {a.line1}
                      {a.city ? `, ${a.city}` : ""}
                      {a.postalCode ? `, ${a.postalCode}` : ""}, {a.country}
                      {a.phone ? ` · ${a.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/account/addresses/${a.id}/edit`} className="h-9 border border-navy px-3 text-sm font-black leading-9 text-navy hover:bg-panel">
                      Edit
                    </Link>
                    {!a.isDefault && (
                      <form action={setDefaultAddress.bind(null, a.id)}>
                        <button type="submit" className="h-9 border border-line px-3 text-sm font-bold text-steel hover:bg-panel">
                          Set default
                        </button>
                      </form>
                    )}
                    <form action={deleteAddress.bind(null, a.id)}>
                      <button type="submit" className="h-9 border border-red-300 px-3 text-sm font-bold text-red-700 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
