"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Customer } from "@prisma/client";
import type { CustomerFormState } from "@/app/admin/(protected)/customers/actions";

type Props = {
  customer?: Customer;
  action: (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
  saved?: boolean;
  submitLabel?: string;
};

function tagsText(value?: string) {
  if (!value) return "";
  try {
    const tags = JSON.parse(value);
    return Array.isArray(tags) ? tags.join(", ") : "";
  } catch {
    return "";
  }
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "保存中..." : label}
    </button>
  );
}

export function CustomerManagementForm({ customer, action, saved, submitLabel = "保存客户" }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">{customer ? "客户操作" : "新增客户"}</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          {customer
            ? "联系信息会根据最新的 Stripe 订单自动更新——此处的手动修改可能会被下一笔已付订单覆盖。"
            : "为通过 WhatsApp 或银行转账下单的买家创建资料，让他们的历史记录集中在一处。"}
        </p>
      </div>
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">客户已更新。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="姓名" name="name" required defaultValue={customer?.name} />
        <Field label="邮箱" name="email" type="email" required defaultValue={customer?.email} />
        <Field label="电话" name="phone" defaultValue={customer?.phone || ""} />
        <Field label="WhatsApp" name="whatsapp" defaultValue={customer?.whatsapp || ""} />
        <Field label="国家" name="country" defaultValue={customer?.country || ""} />
        <Field label="城市" name="city" defaultValue={customer?.city || ""} />
        <Field label="地址" name="address" defaultValue={customer?.address || ""} />
        <Field label="邮编" name="postalCode" defaultValue={customer?.postalCode || ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          客户状态
          <select name="status" defaultValue={customer?.status || "ACTIVE"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="ACTIVE">ACTIVE</option>
            <option value="VIP">VIP</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          角色
          <select name="role" defaultValue={customer?.role || "CUSTOMER"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="WHOLESALE">WHOLESALE</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold">
        标签
        <textarea
          name="tags"
          defaultValue={tagsText(customer?.tags)}
          rows={2}
          placeholder="零售、维修店、批发潜在客户"
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        内部备注
        <textarea
          name="internalNote"
          defaultValue={customer?.internalNote || ""}
          rows={4}
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>
      <div className="flex justify-end">
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
  type = "text"
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
      />
    </label>
  );
}
