import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/app/admin/forgot-password/forgot-password-form";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "忘记密码",
  description: "申请管理员密码重置链接。"
};

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-soft">
        <Link href="/" className="inline-flex items-center gap-3">
          <LogoMark size={44} />
          <span>
            <strong className="block text-xl leading-tight">Partavio 管理后台</strong>
            <small className="font-bold uppercase text-steel">受保护的管理区域</small>
          </span>
        </Link>
        <div className="mt-8">
          <p className="font-black uppercase text-safety">密码重置</p>
          <h1 className="mt-2 text-3xl font-black">忘记密码？</h1>
          <p className="mt-3 text-sm leading-6 text-steel">
            输入您的管理员邮箱，我们将发送重置链接。链接有效期为 30 分钟。
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="mt-6 border-t border-line pt-4 text-sm">
          <Link href="/admin/login" className="font-black text-navy hover:underline">
            返回登录
          </Link>
        </p>
      </section>
    </main>
  );
}
