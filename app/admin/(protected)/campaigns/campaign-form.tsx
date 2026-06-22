"use client";

import { useFormState, useFormStatus } from "react-dom";
import { MainImageUpload } from "@/components/admin-image-upload";
import type { CampaignFormState } from "./actions";

type CampaignView = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  heroImage: string | null;
  bodyHtml: string | null;
  productSlugs: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

function dateTimeLocal(value?: Date | null) {
  if (!value) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function parseSlugs(json: string) {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.join("\n") : "";
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
      className="inline-flex h-12 items-center justify-center bg-brand px-5 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "保存中..." : label}
    </button>
  );
}

export function CampaignForm({
  campaign,
  action,
  submitLabel,
  saved
}: {
  campaign?: CampaignView;
  action: (state: CampaignFormState, formData: FormData) => Promise<CampaignFormState>;
  submitLabel: string;
  saved?: boolean;
}) {
  const [state, formAction] = useFormState(action, {} as CampaignFormState);

  return (
    <form action={formAction} className="grid gap-6">
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">活动已保存。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <Section title="基本信息">
        <Field label="活动标题" name="title" required defaultValue={campaign?.title} />
        <Field label="Slug（落地页地址 /promo/...）" name="slug" required defaultValue={campaign?.slug} placeholder="ramadan-wholesale" />
        <Field label="副标题" name="subtitle" defaultValue={campaign?.subtitle ?? ""} />
        <Checkbox label="启用（关闭则落地页返回 404）" name="isActive" defaultChecked={campaign?.isActive ?? true} />
      </Section>

      <Section title="主视觉与正文">
        <MainImageUpload name="heroImage" label="头图" defaultValue={campaign?.heroImage ?? ""} />
        <Textarea
          label="正文（支持 HTML）"
          name="bodyHtml"
          defaultValue={campaign?.bodyHtml ?? ""}
          rows={8}
          placeholder={"<p>本月 168F 维修套件批发直降 12%。</p>"}
        />
      </Section>

      <Section title="关联产品与按钮">
        <Textarea
          label="关联产品 slug（每行一个，显示为产品卡）"
          name="productSlugsText"
          defaultValue={campaign ? parseSlugs(campaign.productSlugs) : ""}
          rows={5}
          placeholder={"168f-standard-repair-kit\n2-inch-water-pump-seal-kit"}
        />
        <Field label="行动按钮文字" name="ctaLabel" defaultValue={campaign?.ctaLabel ?? ""} placeholder="立即批发询价" />
        <Field label="行动按钮链接" name="ctaHref" defaultValue={campaign?.ctaHref ?? ""} placeholder="/wholesale" />
      </Section>

      <Section title="有效期与 SEO">
        <Field label="开始时间（留空=立即）" name="startsAt" type="datetime-local" defaultValue={dateTimeLocal(campaign?.startsAt)} />
        <Field label="结束时间（留空=不过期）" name="endsAt" type="datetime-local" defaultValue={dateTimeLocal(campaign?.endsAt)} />
        <Field label="SEO 标题" name="seoTitle" defaultValue={campaign?.seoTitle ?? ""} />
        <Textarea label="SEO 描述" name="seoDescription" defaultValue={campaign?.seoDescription ?? ""} rows={2} />
      </Section>

      <div className="sticky bottom-0 flex justify-end border-t border-line bg-white/95 p-4 backdrop-blur">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  rows = 4,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold md:col-span-2">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
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
