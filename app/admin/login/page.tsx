import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = {
  title: "后台登录",
  description: "登录 RepairKit Supply 管理后台。"
};

export default function AdminLoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  const next = searchParams?.next?.startsWith("/admin") ? searchParams.next : "/admin/dashboard";

  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-soft">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center bg-navy text-xl font-black text-white">RK</span>
          <span>
            <strong className="block text-xl leading-tight">RepairKit 管理后台</strong>
            <small className="font-bold uppercase text-steel">受保护的管理区域</small>
          </span>
        </Link>
        <div className="mt-8">
          <p className="font-black uppercase text-safety">仅限管理员</p>
          <h1 className="mt-2 text-3xl font-black">登录</h1>
          <p className="mt-3 text-sm leading-6 text-steel">
            仅 ADMIN 管理员可访问产品管理与仪表盘页面。
          </p>
        </div>
        <AdminLoginForm next={next} />
      </section>
    </main>
  );
}
