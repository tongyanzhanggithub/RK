"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logoutAdmin } from "@/app/admin/auth-actions";
import { AdminSidebarNav } from "@/components/admin-sidebar-nav";
import { LogoMark } from "@/components/logo";

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-panel text-ink lg:grid lg:grid-cols-[260px_1fr]">
      {/* Mobile top bar (desktop hides it; the sidebar header takes over). */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-ink px-4 py-3 text-white lg:hidden">
        <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2">
          <LogoMark size={32} />
          <strong className="text-base">管理后台</strong>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar: collapsible drawer on mobile, fixed column on desktop. */}
      <aside
        className={`${open ? "block" : "hidden"} border-r border-line bg-ink text-white lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto`}
      >
        <div className="hidden border-b border-white/10 p-5 lg:block">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <LogoMark size={44} />
            <span>
              <strong className="block text-lg leading-tight">管理后台</strong>
              <small className="font-bold uppercase text-white/60">Partavio</small>
            </span>
          </Link>
        </div>
        <AdminSidebarNav onNavigate={() => setOpen(false)} />
        {/* Mobile-only: who's signed in + logout (desktop shows these in the top header). */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 p-4 lg:hidden">
          <span className="text-sm font-bold text-white/70">{adminName}</span>
          <form action={logoutAdmin}>
            <button className="h-9 rounded-lg border border-white/30 px-3 text-sm font-black text-white hover:bg-white/10" type="submit">
              退出登录
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Desktop context header. */}
        <header className="sticky top-0 z-30 hidden border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:block">
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
