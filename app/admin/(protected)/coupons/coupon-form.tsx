"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Coupon } from "@prisma/client";
import type { CouponFormState } from "@/app/admin/(protected)/coupons/actions";

type Props = {
  coupon?: Coupon;
  action: (state: CouponFormState, formData: FormData) => Promise<CouponFormState>;
  submitLabel: string;
  saved?: boolean;
};

function discountValue(coupon?: Coupon) {
  if (!coupon) return "";
  if (coupon.type === "FIXED_AMOUNT") return (coupon.value / 100).toFixed(2);
  return String(coupon.value);
}

function money(cents?: number | null) {
  if (!cents) return "";
  return (cents / 100).toFixed(2);
}

function dateTimeValue(value?: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center bg-safety px-5 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "保存中..." : label}
    </button>
  );
}

export function CouponForm({ coupon, action, submitLabel, saved }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-6">
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">优惠券已保存。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <section className="border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="text-xl font-black">优惠券设置</h2>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="优惠码" name="code" required defaultValue={coupon?.code} placeholder="WELCOME10" />
          <label className="grid gap-2 text-sm font-bold">
            类型
            <select name="type" defaultValue={coupon?.type || "PERCENTAGE"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
              <option value="PERCENTAGE">PERCENTAGE</option>
              <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
              <option value="FREE_SHIPPING">FREE_SHIPPING</option>
            </select>
          </label>
          <Field
            label="折扣面值"
            name="discountValue"
            type="number"
            step="0.01"
            defaultValue={discountValue(coupon)}
            placeholder="10 表示 10%，5 表示 $5，0 表示免运费"
          />
          <Field label="最低商品消费（美元）" name="minSubtotal" type="number" step="0.01" defaultValue={money(coupon?.minSubtotalCents)} />
          <Field label="使用次数上限" name="usageLimit" type="number" defaultValue={coupon?.usageLimit ? String(coupon.usageLimit) : ""} />
          <Field label="开始时间" name="startsAt" type="datetime-local" defaultValue={dateTimeValue(coupon?.startsAt)} />
          <Field label="结束时间" name="endsAt" type="datetime-local" defaultValue={dateTimeValue(coupon?.endsAt)} />
          <Checkbox label="生效" name="isActive" defaultChecked={coupon?.isActive ?? true} />
          <Checkbox label="允许批发客户使用" name="allowWholesaleCustomers" defaultChecked={coupon?.allowWholesaleCustomers} />
        </div>
      </section>

      {coupon && (
        <section className="border border-line bg-white p-5">
          <p className="text-sm font-bold text-steel">使用次数</p>
          <strong className="mt-2 block text-3xl font-black">{coupon.usageCount}</strong>
          <p className="mt-2 text-xs leading-5 text-steel">使用次数在 Stripe 确认付款后增加。</p>
        </section>
      )}

      <div className="sticky bottom-0 flex justify-end border-t border-line bg-white/95 p-4 backdrop-blur">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  step,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
      />
    </label>
  );
}

function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  );
}
