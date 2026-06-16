import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/app/account/forgot-password/forgot-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your account password."
};

export default function CustomerForgotPasswordPage() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-soft">
        <p className="font-black uppercase text-safety">Customer account</p>
        <h1 className="mt-2 text-3xl font-black">Forgot your password?</h1>
        <p className="mt-3 text-sm leading-6 text-steel">
          Enter your account email and we&apos;ll send a reset link. It&apos;s valid for 30 minutes.
        </p>
        <ForgotForm />
        <p className="mt-6 border-t border-line pt-4 text-sm">
          <Link href="/account/login" className="font-black text-navy hover:underline">Back to sign in</Link>
        </p>
      </section>
    </main>
  );
}
