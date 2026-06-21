"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  FileSpreadsheet,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
  Star,
  ScrollText,
  Stethoscope,
  Tag,
  Target,
  Ticket,
  Users,
  UserCog
} from "lucide-react";

const items: [string, string, typeof Tag][] = [
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

const superItems: [string, string, typeof Tag][] = [
  ["团队管理", "/admin/team", UserCog],
  ["操作日志", "/admin/activity", ScrollText]
];

export function AdminSidebarNav({ onNavigate, isSuperAdmin = false }: { onNavigate?: () => void; isSuperAdmin?: boolean }) {
  const pathname = usePathname();
  const renderItem = ([label, href, Icon]: [string, string, typeof Tag]) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 px-3 py-3 text-sm font-black transition-colors ${
          active ? "bg-brand text-white" : "text-white/85 hover:bg-white/10"
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  return (
    <nav className="grid gap-1 p-3">
      {items.map(renderItem)}
      {isSuperAdmin && (
        <>
          <div className="mx-3 my-2 border-t border-white/10" />
          <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-wide text-white/40">超级管理员</p>
          {superItems.map(renderItem)}
        </>
      )}
    </nav>
  );
}
