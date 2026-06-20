import type { Metadata } from "next";
import Link from "next/link";
import { ImportForm } from "@/app/admin/(protected)/products/import/import-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "批量导入产品",
  description: "用 CSV 批量新增/更新产品。"
};

export default function AdminProductImportPage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">产品</p>
          <h1 className="text-4xl font-black">批量导入产品</h1>
          <p className="mt-3 max-w-3xl text-steel">
            按 <strong>slug</strong> 匹配：已存在则更新，不存在则新增。先「导出 CSV」拿到模板最稳妥。
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/admin/products/export" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">导出 CSV（模板）</a>
          <Link href="/admin/products" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">返回产品</Link>
        </div>
      </div>

      <section className="mb-6 border border-line bg-panel p-5 text-sm leading-6 text-steel">
        <p className="font-black text-ink">列说明（表头必须包含这些列名，顺序不限）：</p>
        <p className="mt-2">
          <strong>必填</strong>：slug、name、sku、category、shortDescription、retailPrice（美元，如 29.90）
        </p>
        <p className="mt-1">
          <strong>选填</strong>：brand、status（ACTIVE/DRAFT/ARCHIVED）、stock、lowStockThreshold、compareAtPrice、
          fitmentType（SPECIFIC/UNIVERSAL）、fitmentNote、compatibleModels、compatibleEquipment、tags、image
        </p>
        <p className="mt-1">多值字段（compatibleModels 等）用 <strong>分号</strong> 分隔，例如 <code>168F; GX160</code>。</p>
      </section>

      <ImportForm />
    </main>
  );
}
