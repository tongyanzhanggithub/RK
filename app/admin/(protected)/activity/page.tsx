import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "操作日志" };

const PAGE_SIZE = 50;

const ACTION_LABEL: Record<string, string> = {
  "admin.login": "登录后台",
  "product.create": "创建产品",
  "product.update": "编辑产品",
  "product.archive": "归档产品",
  "category.create": "创建分类",
  "category.update": "编辑分类",
  "category.delete": "删除分类",
  "hero.create": "新建轮播",
  "hero.update": "编辑轮播",
  "hero.delete": "删除轮播",
  "team.create": "新增管理员",
  "team.role": "调整角色",
  "team.enable": "启用管理员",
  "team.disable": "停用管理员",
  "team.delete": "删除管理员"
};

export default async function ActivityPage({ searchParams }: { searchParams?: { page?: string } }) {
  await requireSuperAdmin();
  const page = Math.max(1, Number(searchParams?.page || "1") || 1);
  const [total, logs] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    })
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main>
      <div className="mb-8">
        <p className="font-black uppercase text-brand">仅超级管理员</p>
        <h1 className="text-4xl font-black">操作日志</h1>
        <p className="mt-3 text-steel">记录每位管理员的关键操作（登录、产品/分类/轮播增删改、团队变更），共 {total} 条。</p>
      </div>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-panel">
            <tr>
              <th className="p-3">时间</th>
              <th className="p-3">管理员</th>
              <th className="p-3">操作</th>
              <th className="p-3">对象</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center font-bold text-steel">
                  暂无记录（部署后管理员的操作会陆续出现在这里）。
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-line align-top">
                  <td className="whitespace-nowrap p-3 text-steel">
                    {log.createdAt.toLocaleString("zh-CN", { hour12: false })}
                  </td>
                  <td className="p-3 font-bold">{log.adminEmail}</td>
                  <td className="p-3">
                    <span className="font-black">{ACTION_LABEL[log.action] || log.action}</span>
                    {log.detail && <span className="ml-2 text-xs text-steel">{log.detail}</span>}
                  </td>
                  <td className="p-3 text-steel">{log.target || "—"}</td>
                  <td className="p-3 text-xs text-steel">{log.ip || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm font-black">
          {page > 1 && (
            <Link href={`/admin/activity?page=${page - 1}`} className="border border-line px-3 py-1.5 text-navy hover:bg-panel">
              上一页
            </Link>
          )}
          <span className="text-steel">
            第 {page} / {pages} 页
          </span>
          {page < pages && (
            <Link href={`/admin/activity?page=${page + 1}`} className="border border-line px-3 py-1.5 text-navy hover:bg-panel">
              下一页
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
