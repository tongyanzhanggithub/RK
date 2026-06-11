import type { Metadata } from "next";
import Link from "next/link";
import { createCustomer } from "@/app/admin/(protected)/customers/actions";
import { CustomerManagementForm } from "@/app/admin/(protected)/customers/customer-management-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Customer",
  description: "Create a customer profile manually."
};

export default function AdminNewCustomerPage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Customers</p>
          <h1 className="text-4xl font-black">New Customer</h1>
          <p className="mt-3 text-steel">
            Add buyers who order outside the website — WhatsApp deals, bank transfers, trade-show contacts.
          </p>
        </div>
        <Link href="/admin/customers" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Customers
        </Link>
      </div>
      <div className="max-w-3xl">
        <CustomerManagementForm action={createCustomer} submitLabel="Create Customer" />
      </div>
    </main>
  );
}
