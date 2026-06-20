"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createManualOrder, type ManualOrderState } from "@/app/admin/(protected)/orders/manual-actions";
import { formatMoney } from "@/lib/format";

type Item = { slug: string; name: string; sku: string; priceCents: number };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center bg-brand px-6 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60">
      {pending ? "创建中…" : "创建订单"}
    </button>
  );
}

export function ManualOrderForm({ products }: { products: Item[] }) {
  const [state, formAction] = useFormState<ManualOrderState, FormData>(createManualOrder, {});

  return (
    <form action={formAction} className="grid gap-6">
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <section className="border border-line bg-white p-5">
        <h2 className="mb-4 text-lg font-black">客户信息</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="name" label="客户姓名 *" required />
          <Field name="email" label="邮箱 *" type="email" required />
          <Field name="phone" label="电话" />
          <Field name="country" label="国家" />
          <Field name="city" label="城市" />
          <Field name="postalCode" label="邮编" />
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            收货地址
            <input name="address" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
          </label>
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="mb-4 text-lg font-black">商品（填写数量，0 表示不含）</h2>
        <div className="grid gap-2">
          {products.map((p) => (
            <div key={p.slug} className="grid grid-cols-[1fr_auto_80px] items-center gap-3 border-b border-line py-2 text-sm">
              <span className="font-bold">{p.name} <span className="text-steel">· {p.sku}</span></span>
              <span className="text-steel">{formatMoney(p.priceCents, "usd")}</span>
              <input name={`qty_${p.slug}`} type="number" min={0} defaultValue={0} className="h-9 border border-line px-2 text-center outline-none focus:border-navy" />
            </div>
          ))}
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="mb-4 text-lg font-black">支付与运费</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            支付状态
            <select name="paymentStatus" defaultValue="PAID" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
              <option value="PAID">已付款（线下/电汇已到账）</option>
              <option value="PENDING">待付款</option>
            </select>
          </label>
          <Field name="shipping" label="运费（USD）" type="number" />
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            内部备注
            <input name="note" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" placeholder="如：T/T 电汇，水单已收" />
          </label>
        </div>
        <p className="mt-3 text-xs text-steel">标记「已付款」会扣减库存。金额按产品 USD 标价计算。</p>
      </section>

      <div><SubmitButton /></div>
    </form>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input name={name} type={type} required={required} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
    </label>
  );
}
