import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/app/admin/reset-password/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new admin password."
};

export default function ResetPasswordPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = searchParams?.token || "";

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
          <h1 className="mt-2 text-3xl font-black">Set a new password</h1>
          <p className="mt-3 text-sm leading-6 text-steel">
            Choose a new password of at least 8 characters. After saving, sign in again on all devices.
          </p>
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="mt-7 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
            This page requires a valid reset link.{" "}
            <Link href="/admin/forgot-password" className="text-navy underline">
              Request a new one
            </Link>
            .
          </p>
        )}
        <p className="mt-6 border-t border-line pt-4 text-sm">
          <Link href="/admin/login" className="font-black text-navy hover:underline">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
