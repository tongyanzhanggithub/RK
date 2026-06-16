import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountAuthForm } from "@/app/account/account-auth-form";
import { registerCustomer } from "@/app/account/actions";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an account to track and manage your orders."
};

export default async function AccountRegisterPage() {
  if (await getCurrentCustomer()) redirect("/account");

  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-soft">
        <p className="font-black uppercase text-safety">Customer account</p>
        <h1 className="mt-2 text-3xl font-black">Create an account</h1>
        <p className="mt-3 text-sm leading-6 text-steel">
          Track orders, reorder faster and keep your details on file. Already have an account?{" "}
          <Link href="/account/login" className="font-black text-navy hover:underline">Sign in</Link>.
        </p>
        <AccountAuthForm action={registerCustomer} mode="register" />
        <p className="mt-5 text-xs leading-5 text-steel">
          Ordering by card stays guest-friendly — an account just lets you see your order history. Wholesale buyers
          should use the{" "}
          <Link href="/wholesale" className="font-bold text-navy underline">wholesale application</Link>.
        </p>
      </section>
    </main>
  );
}
