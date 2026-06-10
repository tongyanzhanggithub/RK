import Link from "next/link";
import { BarChart3, Boxes, FileText, LayoutDashboard, Package, Settings, ShoppingBag, Tag, Ticket, Users } from "lucide-react";
import { logoutAdmin } from "@/app/admin/auth-actions";

const activeItems = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard],
  ["Products", "/admin/products", Package],
  ["Orders", "/admin/orders", ShoppingBag],
  ["Inventory", "/admin/inventory", Boxes],
  ["Customers", "/admin/customers", Users],
  ["Wholesale", "/admin/wholesale", BarChart3],
  ["Coupons", "/admin/coupons", Ticket]
];

const plannedItems = [
  ["Categories", Tag],
  ["Repair Guides", FileText],
  ["Settings", Settings]
];

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  return (
    <div className="min-h-screen bg-panel text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-line bg-ink text-white">
        <div className="border-b border-white/10 p-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center bg-safety text-xl font-black text-ink">RK</span>
            <span>
              <strong className="block text-lg leading-tight">Admin</strong>
              <small className="font-bold uppercase text-white/60">RepairKit Supply</small>
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
          <div className="my-3 border-t border-white/10" />
          {plannedItems.map(([label, Icon]) => (
            <div key={label as string} className="flex items-center justify-between gap-3 px-3 py-3 text-sm font-bold text-white/35">
              <span className="inline-flex items-center gap-3">
                <Icon size={18} />
                {label as string}
              </span>
              <span className="text-[10px] uppercase">Later</span>
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-safety">Phase Admin 5</p>
              <p className="text-sm text-steel">Wholesale applications and coupon management</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-steel">{adminName}</span>
              <form action={logoutAdmin}>
                <button className="h-10 border border-line px-3 text-sm font-black text-navy hover:bg-panel" type="submit">
                  Logout
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
