import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/app/account/reset-password/reset-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new account password."
};

export default function CustomerResetPasswordPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = searchParams?.token || "";
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-soft">
        <p className="font-black uppercase text-safety">Customer account</p>
        <h1 className="mt-2 text-3xl font-black">Set a new password</h1>
        {token ? (
          <ResetForm token={token} />
        ) : (
          <p className="mt-7 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
            This page needs a valid reset link.{" "}
            <Link href="/account/forgot-password" className="text-navy underline">Request a new one</Link>.
          </p>
        )}
        <p className="mt-6 border-t border-line pt-4 text-sm">
          <Link href="/account/login" className="font-black text-navy hover:underline">Back to sign in</Link>
        </p>
      </section>
    </main>
  );
}
