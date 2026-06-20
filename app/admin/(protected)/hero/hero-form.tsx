"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { HeroFormState } from "@/app/admin/(protected)/hero/actions";

type SlideDefaults = {
  badge: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  primaryExternal: boolean;
  primaryWhatsapp: boolean;
  secondaryLabel: string | null;
  secondaryHref: string | null;
  panelTitle: string;
  bullets: string; // JSON
  sortOrder: number;
  isActive: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center bg-brand px-6 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60">
      {pending ? "保存中..." : "保存"}
    </button>
  );
}

const field = "border border-line px-3 py-2";
const labelCls = "grid gap-1 text-sm font-bold text-steel";

export function HeroForm({
  action,
  slide
}: {
  action: (prev: HeroFormState, fd: FormData) => Promise<HeroFormState>;
  slide?: SlideDefaults;
}) {
  const [state, formAction] = useFormState(action, {});
  const bulletsText = slide?.bullets ? (JSON.parse(slide.bullets) as string[]).join("\n") : "";

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 border border-line bg-white p-6">
      <label className={labelCls}>
        小标签 Badge
        <input name="badge" defaultValue={slide?.badge || ""} className={field} placeholder="Shop by your engine" />
      </label>
      <label className={labelCls}>
        大标题 Title *
        <input name="title" required defaultValue={slide?.title || ""} className={field} />
      </label>
      <label className={labelCls}>
        副标题 Subtitle
        <textarea name="subtitle" rows={2} defaultValue={slide?.subtitle || ""} className={field} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          主按钮文字 *
          <input name="primaryLabel" required defaultValue={slide?.primaryLabel || ""} className={field} placeholder="Find my parts" />
        </label>
        <label className={labelCls}>
          主按钮链接
          <input name="primaryHref" defaultValue={slide?.primaryHref || "/products"} className={field} placeholder="/products" />
        </label>
        <label className={labelCls}>
          次按钮文字(可选)
          <input name="secondaryLabel" defaultValue={slide?.secondaryLabel || ""} className={field} placeholder="All engine models" />
        </label>
        <label className={labelCls}>
          次按钮链接(可选)
          <input name="secondaryHref" defaultValue={slide?.secondaryHref || ""} className={field} placeholder="/engines" />
        </label>
      </div>
      <div className="flex flex-wrap gap-5 text-sm font-bold">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="primaryExternal" defaultChecked={slide?.primaryExternal || false} /> 主按钮为外部链接(新窗口打开)
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="primaryWhatsapp" defaultChecked={slide?.primaryWhatsapp || false} /> 主按钮显示 WhatsApp 图标
        </label>
      </div>

      <label className={labelCls}>
        右侧面板标题 *
        <input name="panelTitle" required defaultValue={slide?.panelTitle || ""} className={field} placeholder="Fitment you can trust" />
      </label>
      <label className={labelCls}>
        面板卖点(每行一条)
        <textarea name="bullets" rows={4} defaultValue={bulletsText} className={field} placeholder={"Confirmed-fit badge on every part\nSave your machines in My Garage"} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          排序(小的在前)
          <input name="sortOrder" type="number" defaultValue={slide?.sortOrder ?? 0} className={field} />
        </label>
        <label className="inline-flex items-center gap-2 self-end text-sm font-bold">
          <input type="checkbox" name="isActive" defaultChecked={slide ? slide.isActive : true} /> 启用(显示在首页)
        </label>
      </div>

      {state.error && <p className="text-sm font-bold text-red-700">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
