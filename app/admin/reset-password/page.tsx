import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/app/admin/reset-password/reset-password-form";

export const metadata: Metadata = {
  title: "重置密码",
  description: "设置新的管理员密码。"
};

export default function ResetPasswordPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = searchParams?.token || "";

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
          <p className="font-black uppercase text-safety">密码重置</p>
          <h1 className="mt-2 text-3xl font-black">设置新密码</h1>
          <p className="mt-3 text-sm leading-6 text-steel">
            请设置一个至少 8 个字符的新密码。保存后，需在所有设备上重新登录。
          </p>
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="mt-7 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
            此页面需要有效的重置链接。{" "}
            <Link href="/admin/forgot-password" className="text-navy underline">
              重新申请
            </Link>
            。
          </p>
        )}
        <p className="mt-6 border-t border-line pt-4 text-sm">
          <Link href="/admin/login" className="font-black text-navy hover:underline">
            返回登录
          </Link>
        </p>
      </section>
    </main>
  );
}
