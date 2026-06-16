import type { Metadata } from "next";
import Link from "next/link";
import { analyzeProductFitment, engineCoverage, fitmentSummary } from "@/lib/fitment";
import { getStoreProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "适配健康度",
  description: "管理产品适配数据的完整度与准确度——eBay Fitment 式的运营工具。"
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ok: { label: "已匹配", cls: "bg-green-100 text-green-800" },
  universal: { label: "通用件", cls: "bg-navy text-white" },
  warn: { label: "需清洗", cls: "bg-amber-100 text-amber-800" },
  gap: { label: "缺适配", cls: "bg-red-100 text-red-800" }
};

export default async function AdminFitmentPage() {
  const products = await getStoreProducts();
  const analyses = products.map((product) => analyzeProductFitment(product));
  const summary = fitmentSummary(analyses);
  const coverage = engineCoverage(products);

  // Surface the problems first: gaps, then warnings, then the rest.
  const order = { gap: 0, warn: 1, ok: 2, universal: 3 } as const;
  const sorted = [...analyses].sort((a, b) => order[a.status] - order[b.status]);

  const maxCoverage = Math.max(1, ...coverage.map((c) => c.specificCount));

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">适配数据</p>
          <h1 className="text-4xl font-black">适配健康度</h1>
          <p className="mt-3 max-w-3xl text-steel">
            适配数据做得<strong>全</strong>又<strong>准</strong>，才能吃到长尾订单（eBay Fitment 思路）。
            这里标出没适配数据的产品、和规范型号对不上的文本，以及零件偏少的发动机。
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="适配覆盖率" value={`${summary.coveragePct}%`} hint={`${summary.withFitment}/${summary.total} 个产品有可用适配`} />
        <Metric label="缺适配（红）" value={String(summary.gaps)} hint="特定件却没填兼容型号" />
        <Metric label="需清洗（黄）" value={String(summary.warnings)} hint="文本与规范型号对不上" />
        <Metric label="通用件" value={String(summary.universal)} hint="适配所有小型发动机" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="overflow-x-auto border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">产品适配状态</h2>
            <p className="mt-1 text-sm text-steel">红/黄优先处理。点产品名去编辑适配字段。</p>
          </div>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-panel text-xs uppercase text-steel">
              <tr>
                <th className="p-3">产品</th>
                <th className="p-3">状态</th>
                <th className="p-3">匹配的规范型号</th>
                <th className="p-3">对不上的文本</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ product, status, matched, unmatched }) => {
                const badge = STATUS_BADGE[status];
                return (
                  <tr key={product.slug} className="border-t border-line align-top">
                    <td className="p-3 font-black">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-navy hover:underline">
                        {product.name}
                      </Link>
                    </td>
                    <td className="p-3"><span className={`inline-flex px-2 py-1 text-xs font-black ${badge.cls}`}>{badge.label}</span></td>
                    <td className="p-3 text-steel">{matched.join("、") || "—"}</td>
                    <td className="p-3">
                      {unmatched.length > 0 ? (
                        <span className="font-bold text-amber-700">{unmatched.join("、")}</span>
                      ) : (
                        <span className="text-steel">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">各发动机零件覆盖</h2>
            <p className="mt-1 text-sm text-steel">数量少的型号 = 长尾扩品机会。</p>
          </div>
          <div className="grid gap-3 p-5">
            {coverage
              .slice()
              .sort((a, b) => a.specificCount - b.specificCount)
              .map(({ engine, specificCount }) => (
                <Link key={engine.slug} href={`/engines/${engine.slug}`} className="group grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-black group-hover:text-navy">{engine.name}</span>
                    <span className={`font-black ${specificCount === 0 ? "text-red-700" : specificCount <= 1 ? "text-amber-700" : "text-ink"}`}>
                      {specificCount} 件
                    </span>
                  </div>
                  <div className="h-2 bg-panel">
                    <div
                      className={`h-2 ${specificCount === 0 ? "bg-red-400" : specificCount <= 1 ? "bg-amber-400" : "bg-navy"}`}
                      style={{ width: `${Math.max(4, (specificCount / maxCoverage) * 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-sm font-bold text-steel">{label}</p>
      <strong className="mt-2 block text-3xl font-black">{value}</strong>
      {hint && <p className="mt-1 text-xs leading-5 text-steel">{hint}</p>}
    </div>
  );
}
