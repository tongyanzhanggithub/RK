import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountAuthForm } from "@/app/account/account-auth-form";
import { loginCustomer } from "@/app/account/actions";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to track and manage your orders."
};

export default async function AccountLoginPage({ searchParams }: { searchParams?: { registered?: string; reset?: string } }) {
  if (await getCurrentCustomer()) redirect("/account");

  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-soft">
        <p className="font-black uppercase text-safety">Customer account</p>
        <h1 className="mt-2 text-3xl font-black">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-steel">
          Track your orders and reorder faster. New here?{" "}
          <Link href="/account/register" className="font-black text-navy hover:underline">Create an account</Link>.
        </p>
        {searchParams?.registered === "1" && (
          <p className="mt-5 border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">
            Account created — please sign in.
          </p>
        )}
        {searchParams?.reset === "1" && (
          <p className="mt-5 border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">
            Password updated — please sign in with your new password.
          </p>
        )}
        <AccountAuthForm action={loginCustomer} mode="login" />
        <p className="mt-5 text-sm">
          <Link href="/account/forgot-password" className="font-black text-navy hover:underline">Forgot your password?</Link>
        </p>
      </section>
    </main>
  );
}
