import Link from "next/link";
import { logoutAdmin } from "@/app/admin/auth-actions";
import { AdminSidebarNav } from "@/components/admin-sidebar-nav";
import { LogoMark } from "@/components/logo";

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  return (
    <div className="min-h-screen bg-panel text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-line bg-ink text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="border-b border-white/10 p-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <LogoMark size={44} />
            <span>
              <strong className="block text-lg leading-tight">管理后台</strong>
              <small className="font-bold uppercase text-white/60">Partavio</small>
            </span>
          </Link>
        </div>
        <AdminSidebarNav />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-brand">Partavio 管理后台</p>
              <p className="text-sm text-steel">商品 · 订单 · 库存 · 内容管理</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-steel">{adminName}</span>
              <form action={logoutAdmin}>
                <button className="h-10 border border-line px-3 text-sm font-black text-navy hover:bg-panel" type="submit">
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
