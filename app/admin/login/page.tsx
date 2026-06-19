import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = {
  title: "管理员登录",
  description: "登录 Partavio 管理系统。"
};

export default function AdminLoginPage({ searchParams }: { searchParams?: { next?: string; reset?: string } }) {
  const next = searchParams?.next?.startsWith("/admin") ? searchParams.next : "/admin/dashboard";
  const justReset = searchParams?.reset === "1";

  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-soft">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center bg-navy text-xl font-black text-white">PV</span>
          <span>
            <strong className="block text-xl leading-tight">RepairKit 管理后台</strong>
            <small className="font-bold uppercase text-steel">受保护的管理区域</small>
          </span>
        </Link>
        <div className="mt-8">
          <p className="font-black uppercase text-safety">仅限管理员</p>
          <h1 className="mt-2 text-3xl font-black">登录</h1>
          <p className="mt-3 text-sm leading-6 text-steel">
            只有 ADMIN 用户才能访问产品管理和仪表盘页面。
          </p>
        </div>
        {justReset && (
          <p className="mt-5 border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">
            密码已更新。请使用新密码登录。
          </p>
        )}
        <AdminLoginForm next={next} />
        <p className="mt-5 text-sm">
          <Link href="/admin/forgot-password" className="font-black text-navy hover:underline">
            忘记密码？
          </Link>
        </p>
      </section>
    </main>
  );
}
