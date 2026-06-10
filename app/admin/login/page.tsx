import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the RepairKit Supply admin system."
};

export default function AdminLoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  const next = searchParams?.next?.startsWith("/admin") ? searchParams.next : "/admin/dashboard";

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
          <p className="font-black uppercase text-safety">Admin Only</p>
          <h1 className="mt-2 text-3xl font-black">Sign in</h1>
          <p className="mt-3 text-sm leading-6 text-steel">
            Only ADMIN users can access product management and dashboard pages.
          </p>
        </div>
        <AdminLoginForm next={next} />
      </section>
    </main>
  );
}
