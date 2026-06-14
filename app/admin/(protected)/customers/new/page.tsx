import type { Metadata } from "next";
import Link from "next/link";
import { createCustomer } from "@/app/admin/(protected)/customers/actions";
import { CustomerManagementForm } from "@/app/admin/(protected)/customers/customer-management-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "新增客户",
  description: "手动创建客户资料。"
};

export default function AdminNewCustomerPage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">客户</p>
          <h1 className="text-4xl font-black">新增客户</h1>
          <p className="mt-3 text-steel">
            添加在网站之外下单的买家——WhatsApp 成交、银行转账、展会联系人。
          </p>
        </div>
        <Link href="/admin/customers" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回客户列表
        </Link>
      </div>
      <div className="max-w-3xl">
        <CustomerManagementForm action={createCustomer} submitLabel="创建客户" />
      </div>
    </main>
  );
}
