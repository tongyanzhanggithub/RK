import type { Metadata } from "next";
import { ShieldCheck, User } from "lucide-react";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { CreateAdminForm } from "@/app/admin/(protected)/team/team-form";
import { deleteAdmin, setAdminActive, setAdminRole } from "@/app/admin/(protected)/team/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "团队管理" };

export default async function TeamPage() {
  const me = await requireSuperAdmin();
  const admins = await prisma.adminUser.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }
  });

  return (
    <main>
      <div className="mb-8">
        <p className="font-black uppercase text-brand">仅超级管理员</p>
        <h1 className="text-4xl font-black">团队管理</h1>
        <p className="mt-3 text-steel">新增/停用/删除管理员、调整角色。系统始终保留至少一名启用的超级管理员。</p>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-black">新增管理员</h2>
        <CreateAdminForm />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">现有管理员（{admins.length}）</h2>
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-panel">
              <tr>
                <th className="p-3">管理员</th>
                <th className="p-3">角色</th>
                <th className="p-3">状态</th>
                <th className="p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.id === me.id;
                const isSuper = a.role === "SUPER_ADMIN";
                return (
                  <tr key={a.id} className="border-t border-line align-middle">
                    <td className="p-3">
                      <div className="flex items-center gap-2 font-black">
                        {isSuper ? <ShieldCheck size={16} className="text-brand" /> : <User size={16} className="text-steel" />}
                        {a.name} {isSelf && <span className="text-xs font-bold text-steel">（你）</span>}
                      </div>
                      <div className="text-xs text-steel">{a.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-black ${isSuper ? "bg-brand/15 text-[#0b2545]" : "bg-panel text-steel"}`}>
                        {isSuper ? "超级管理员" : "普通管理员"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-black ${a.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {a.isActive ? "启用" : "已停用"}
                      </span>
                    </td>
                    <td className="p-3">
                      {isSelf ? (
                        <span className="text-xs text-steel">不能对自己操作</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={setAdminRole.bind(null, a.id, isSuper ? "ADMIN" : "SUPER_ADMIN")}>
                            <button className="border border-line px-2 py-1 text-xs font-black text-navy hover:bg-panel" type="submit">
                              {isSuper ? "降为普通" : "升为超管"}
                            </button>
                          </form>
                          <form action={setAdminActive.bind(null, a.id, !a.isActive)}>
                            <button className="border border-line px-2 py-1 text-xs font-black text-navy hover:bg-panel" type="submit">
                              {a.isActive ? "停用" : "启用"}
                            </button>
                          </form>
                          <form action={deleteAdmin.bind(null, a.id)}>
                            <button className="border border-red-300 px-2 py-1 text-xs font-black text-red-700 hover:bg-red-50" type="submit">
                              删除
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
