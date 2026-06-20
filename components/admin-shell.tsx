import Link from "next/link";
import { BarChart3, Boxes, FileText, FileSpreadsheet, GalleryHorizontalEnd, LayoutDashboard, MessageSquareQuote, Package, RotateCcw, Settings, ShoppingBag, Star, Stethoscope, Tag, Target, Ticket, Users } from "lucide-react";
import { logoutAdmin } from "@/app/admin/auth-actions";
import { LogoMark } from "@/components/logo";

const activeItems = [
  ["仪表盘", "/admin/dashboard", LayoutDashboard],
  ["首页轮播", "/admin/hero", GalleryHorizontalEnd],
  ["产品", "/admin/products", Package],
  ["适配健康度", "/admin/fitment", Target],
  ["订单", "/admin/orders", ShoppingBag],
  ["退货", "/admin/returns", RotateCcw],
  ["库存", "/admin/inventory", Boxes],
  ["客户", "/admin/customers", Users],
  ["批发", "/admin/wholesale", BarChart3],
  ["询价单", "/admin/quotes", FileSpreadsheet],
  ["优惠券", "/admin/coupons", Ticket],
  ["用户评价", "/admin/testimonials", MessageSquareQuote],
  ["产品评价", "/admin/reviews", Star],
  ["分类", "/admin/categories", Tag],
  ["故障排查", "/admin/problems", Stethoscope],
  ["维修指南", "/admin/guides", FileText],
  ["设置", "/admin/settings", Settings]
];

const plannedItems: [string, typeof Tag][] = [];

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  return (
    <div className="min-h-screen bg-panel text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-line bg-ink text-white">
        <div className="border-b border-white/10 p-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <LogoMark size={44} />
            <span>
              <strong className="block text-lg leading-tight">管理后台</strong>
              <small className="font-bold uppercase text-white/60">Partavio</small>
            </span>
          </Link>
        </div>
        <nav className="grid gap-1 p-3">
          {activeItems.map(([label, href, Icon]) => (
            <Link key={href as string} href={href as string} className="flex items-center gap-3 px-3 py-3 text-sm font-black text-white/85 hover:bg-white/10">
              <Icon size={18} />
              {label as string}
            </Link>
          ))}
          {plannedItems.length > 0 && (
            <>
              <div className="my-3 border-t border-white/10" />
              {plannedItems.map(([label, Icon]) => (
                <div key={label} className="flex items-center justify-between gap-3 px-3 py-3 text-sm font-bold text-white/35">
                  <span className="inline-flex items-center gap-3">
                    <Icon size={18} />
                    {label}
                  </span>
                  <span className="text-[10px] uppercase">即将推出</span>
                </div>
              ))}
            </>
          )}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-brand">管理后台 第五阶段</p>
              <p className="text-sm text-steel">批发申请与优惠券管理</p>
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
