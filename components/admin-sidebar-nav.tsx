"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  RotateCcw,
  ScrollText,
  Settings,
  ShoppingBag,
  Star,
  Stethoscope,
  Tag,
  Target,
  Ticket,
  UserCog,
  Users
} from "lucide-react";

type Item = [label: string, href: string, icon: typeof Tag];
type Group = { label: string; items: Item[] };

// 仪表盘 stays pinned at the top (no group). Everything else is grouped + collapsible.
const DASHBOARD: Item = ["仪表盘", "/admin/dashboard", LayoutDashboard];

const GROUPS: Group[] = [
  { label: "商品", items: [["产品", "/admin/products", Package], ["分类", "/admin/categories", Tag], ["库存", "/admin/inventory", Boxes], ["适配健康度", "/admin/fitment", Target]] },
  { label: "销售", items: [["订单", "/admin/orders", ShoppingBag], ["退货", "/admin/returns", RotateCcw], ["客户", "/admin/customers", Users]] },
  { label: "批发", items: [["批发申请", "/admin/wholesale", BarChart3], ["询价单", "/admin/quotes", FileSpreadsheet]] },
  { label: "营销", items: [["优惠券", "/admin/coupons", Ticket], ["首页轮播", "/admin/hero", GalleryHorizontalEnd]] },
  { label: "内容", items: [["故障排查", "/admin/problems", Stethoscope], ["维修指南", "/admin/guides", FileText], ["用户评价", "/admin/testimonials", MessageSquareQuote], ["产品评价", "/admin/reviews", Star]] },
  { label: "系统", items: [["设置", "/admin/settings", Settings]] }
];

const SUPER_GROUP: Group = {
  label: "超级管理员",
  items: [["团队管理", "/admin/team", UserCog], ["操作日志", "/admin/activity", ScrollText]]
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav({ onNavigate, isSuperAdmin = false }: { onNavigate?: () => void; isSuperAdmin?: boolean }) {
  const pathname = usePathname();
  const groups = isSuperAdmin ? [...GROUPS, SUPER_GROUP] : GROUPS;

  // Open by default only the group that contains the current page (keeps the list short).
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of groups) init[g.label] = g.items.some((it) => isActive(pathname, it[1]));
    return init;
  });

  const linkCls = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 text-sm font-black transition-colors ${
      active ? "bg-brand text-white" : "text-white/85 hover:bg-white/10"
    }`;

  return (
    <nav className="grid gap-1 p-3">
      <Link
        href={DASHBOARD[1]}
        onClick={onNavigate}
        aria-current={isActive(pathname, DASHBOARD[1]) ? "page" : undefined}
        className={linkCls(isActive(pathname, DASHBOARD[1]))}
      >
        <LayoutDashboard size={18} />
        {DASHBOARD[0]}
      </Link>

      {groups.map((group) => {
        const groupActive = group.items.some((it) => isActive(pathname, it[1]));
        const isOpen = open[group.label] ?? groupActive;
        return (
          <div key={group.label} className="mt-1">
            <button
              type="button"
              onClick={() => setOpen((s) => ({ ...s, [group.label]: !isOpen }))}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white/45 hover:text-white/70"
            >
              {group.label}
              <ChevronDown size={14} className={`transition-transform ${isOpen ? "" : "-rotate-90"}`} />
            </button>
            {isOpen && (
              <div className="grid gap-0.5">
                {group.items.map(([label, href, Icon]) => {
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={linkCls(active)}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
