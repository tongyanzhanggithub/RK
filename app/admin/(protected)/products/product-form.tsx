"use client";

import { useFormState, useFormStatus } from "react-dom";
import { GalleryUpload, MainImageUpload } from "@/components/admin-image-upload";
import { FitmentModelPicker } from "@/components/fitment-model-picker";
import type { ProductFormState } from "@/app/admin/(protected)/products/actions";
import type { Product } from "@/data/products";

type ProductFormProps = {
  product?: Product;
  categories: string[];
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  submitLabel: string;
  saved?: boolean;
};

function money(cents?: number) {
  if (!cents) return "";
  return (cents / 100).toFixed(2);
}

function dateTimeLocal(value?: Date | string | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // Format as local datetime-local value (YYYY-MM-DDTHH:mm).
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function list(items?: string[]) {
  return items?.join("\n") || "";
}

function specs(items?: Product["specifications"]) {
  return items?.map((item) => `${item.label}: ${item.value}`).join("\n") || "";
}

function faqs(items?: Product["faqs"]) {
  return items?.map((item) => `${item.question} | ${item.answer}`).join("\n") || "";
}

function images(items?: Product["images"]) {
  return items?.map((item) => `${item.url} | ${item.alt}${item.isPrimary ? " | primary" : ""}`).join("\n") || "";
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

export function ProductForm({ product, categories, action, submitLabel, saved }: ProductFormProps) {
  const initialState: ProductFormState = {};
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="grid gap-6">
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">产品已保存。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <Section title="基本信息">
        <Field label="产品名称" name="name" required defaultValue={product?.name} />
        <Field label="Slug" name="slug" required defaultValue={product?.slug} placeholder="168f-standard-repair-kit" />
        <Field label="副标题" name="subtitle" defaultValue={product?.subtitle} />
        <Field label="SKU" name="sku" required defaultValue={product?.sku} placeholder="SERK-0001" />
        <label className="grid gap-2 text-sm font-bold">
          分类
          <input
            name="category"
            list="admin-product-categories"
            required
            defaultValue={product?.category}
            className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          />
          <datalist id="admin-product-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>
        <Field label="品牌" name="brand" defaultValue={product?.brand || "Partavio"} />
        <Textarea label="简短描述" name="shortDescription" required defaultValue={product?.shortDescription} />
        <Textarea label="详细描述" name="description" defaultValue={product?.description} />
        <label className="grid gap-2 text-sm font-bold">
          产品状态
          <select name="status" defaultValue={product?.status || "ACTIVE"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="ACTIVE">在售</option>
            <option value="DRAFT">草稿</option>
            <option value="ARCHIVED">已归档</option>
          </select>
        </label>
        <Checkbox label="精选" name="isFeatured" defaultChecked={product?.isFeatured} />
        <Checkbox label="热销" name="isHotSeller" defaultChecked={product?.isHotSeller} />
        <Checkbox label="可批发" name="wholesaleAvailable" defaultChecked={product?.wholesaleAvailable} />
      </Section>

      <Section title="价格信息">
        <Field label="零售价 USD" name="retailPrice" required type="number" step="0.01" defaultValue={money(product?.priceCents)} />
        <Field label="划线价 USD" name="compareAtPrice" type="number" step="0.01" defaultValue={money(product?.compareAtPriceCents)} />
        <Field label="批发价 USD" name="wholesalePrice" type="number" step="0.01" defaultValue={money(product?.wholesalePriceCents)} />
        <Field label="限时促销价 USD（低于零售价才生效，留空=无促销）" name="salePrice" type="number" step="0.01" defaultValue={money(product?.salePriceCents)} />
        <Field label="促销开始时间（留空=立即）" name="saleStartsAt" type="datetime-local" defaultValue={dateTimeLocal(product?.saleStartsAt)} />
        <Field label="促销结束时间（留空=不过期；填了前台显示倒计时）" name="saleEndsAt" type="datetime-local" defaultValue={dateTimeLocal(product?.saleEndsAt)} />
        <Field label="成本价 USD" name="costPrice" type="number" step="0.01" defaultValue={money(product?.costPriceCents)} />
        <label className="grid gap-2 text-sm font-bold">
          货币
          <select name="currency" defaultValue="usd" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="usd">USD</option>
          </select>
        </label>
        <Checkbox label="允许使用优惠券" name="allowCoupons" defaultChecked={product?.allowCoupons !== false} />
      </Section>

      <Section title="库存与物流">
        <Field label="当前库存" name="stock" required type="number" defaultValue={String(product?.stock ?? 0)} />
        <Field label="低库存预警阈值" name="lowStockThreshold" required type="number" defaultValue={String(product?.lowStockThreshold ?? 5)} />
        <Field label="重量（克）" name="weightGrams" type="number" defaultValue={String(product?.weightGrams || "")} />
        <Field label="长度（毫米）" name="lengthMm" type="number" defaultValue={String(product?.lengthMm || "")} />
        <Field label="宽度（毫米）" name="widthMm" type="number" defaultValue={String(product?.widthMm || "")} />
        <Field label="高度（毫米）" name="heightMm" type="number" defaultValue={String(product?.heightMm || "")} />
      </Section>

      <Section title="图片">
        <MainImageUpload name="image" label="主图" defaultValue={product?.image ?? ""} />
        <GalleryUpload name="imagesText" label="相册图片（每行一条：url | alt | primary）" defaultValue={images(product?.images)} />
      </Section>

      <Section title="套件与适配">
        <label className="grid gap-2 text-sm font-bold">
          适配类型
          <select name="fitmentType" defaultValue={product?.fitmentType || "SPECIFIC"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="SPECIFIC">SPECIFIC — 须匹配兼容型号</option>
            <option value="UNIVERSAL">UNIVERSAL — 适配所有小型发动机</option>
          </select>
        </label>
        <Field
          label="适配说明（显示在 Universal 徽章旁）"
          name="fitmentNote"
          defaultValue={product?.fitmentNote}
          placeholder="适配使用 5.5mm 内径油管的发动机"
        />
        <label className="flex items-start gap-3 text-sm font-bold md:col-span-2">
          <input type="checkbox" name="fitmentGuaranteed" defaultChecked={product?.fitmentGuaranteed ?? false} className="mt-1 h-4 w-4" />
          <span>
            保证适配资格（Guaranteed Fit）
            <span className="mt-0.5 block text-xs font-normal text-steel">
              勾选后：当买家选择的发动机在兼容型号内时，前台显示绿色「保证适配」徽章并承诺装不上 30 天免费退货。仅对已核实兼容型号的具体件勾选；通用件无需勾选。
            </span>
          </span>
        </label>
        <Textarea label="标签" name="tagsText" defaultValue={list(product?.tags)} placeholder="热销&#10;适用于 168F" />
        <Textarea label="套件包含" name="kitIncludesText" defaultValue={list(product?.kitIncludes)} placeholder="化油器 x1&#10;火花塞 x1" />
        <FitmentModelPicker defaultModels={product?.compatibleModels ?? []} />
        <Textarea label="兼容设备" name="compatibleEquipmentText" defaultValue={list(product?.compatibleEquipment)} placeholder="便携式发电机&#10;汽油水泵" />
        <Textarea label="可解决的问题" name="problemsSolvedText" defaultValue={list(product?.problemsSolved)} placeholder="发动机无法启动&#10;启动困难" />
        <Textarea label="不兼容项" name="notCompatibleWithText" defaultValue={list(product?.notCompatibleWith)} />
        <Textarea label="规格参数" name="specificationsText" defaultValue={specs(product?.specifications)} placeholder="材质: 金属 + 橡胶" />
        <Textarea label="常见问题" name="faqsText" defaultValue={faqs(product?.faqs)} placeholder="是否支持在线结账？ | 是，支持 Stripe Checkout。" />
      </Section>

      <Section title="SEO">
        <Field label="SEO 标题" name="seoTitle" defaultValue={product?.seoTitle} />
        <Textarea label="SEO 描述" name="seoDescription" defaultValue={product?.seoDescription} />
        <Field label="SEO 关键词" name="seoKeywords" defaultValue={product?.seoKeywords} />
        <Field label="Open Graph 图片" name="ogImage" defaultValue={product?.ogImage} />
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

function Textarea({
  label,
  name,
  defaultValue,
  required,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold md:col-span-2">
      {label}
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={4}
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
