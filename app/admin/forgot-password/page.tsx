import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/app/admin/forgot-password/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request an admin password reset link."
};

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-soft">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center bg-navy text-xl font-black text-white">RK</span>
          <span>
            <strong className="block text-xl leading-tight">RepairKit Admin</strong>
            <small className="font-bold uppercase text-steel">Protected management area</small>
          </span>
        </Link>
        <div className="mt-8">
          <p className="font-black uppercase text-safety">Password Reset</p>
          <h1 className="mt-2 text-3xl font-black">Forgot your password?</h1>
          <p className="mt-3 text-sm leading-6 text-steel">
            Enter your admin email and we will send a reset link. The link is valid for 30 minutes.
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="mt-6 border-t border-line pt-4 text-sm">
          <Link href="/admin/login" className="font-black text-navy hover:underline">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
