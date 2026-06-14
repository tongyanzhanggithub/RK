"use client";

import { useFormState, useFormStatus } from "react-dom";
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
      className="inline-flex h-12 items-center justify-center bg-safety px-5 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function ProductForm({ product, categories, action, submitLabel, saved }: ProductFormProps) {
  const initialState: ProductFormState = {};
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="grid gap-6">
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Product saved.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <Section title="Basic Information">
        <Field label="Product Name" name="name" required defaultValue={product?.name} />
        <Field label="Slug" name="slug" required defaultValue={product?.slug} placeholder="168f-standard-repair-kit" />
        <Field label="Subtitle" name="subtitle" defaultValue={product?.subtitle} />
        <Field label="SKU" name="sku" required defaultValue={product?.sku} placeholder="SERK-0001" />
        <label className="grid gap-2 text-sm font-bold">
          Category
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
        <Field label="Brand" name="brand" defaultValue={product?.brand || "RepairKit Supply"} />
        <Textarea label="Short Description" name="shortDescription" required defaultValue={product?.shortDescription} />
        <Textarea label="Detailed Description" name="description" defaultValue={product?.description} />
        <label className="grid gap-2 text-sm font-bold">
          Product Status
          <select name="status" defaultValue={product?.status || "ACTIVE"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </label>
        <Checkbox label="Featured" name="isFeatured" defaultChecked={product?.isFeatured} />
        <Checkbox label="Hot Seller" name="isHotSeller" defaultChecked={product?.isHotSeller} />
        <Checkbox label="Wholesale Available" name="wholesaleAvailable" defaultChecked={product?.wholesaleAvailable} />
      </Section>

      <Section title="Price Information">
        <Field label="Retail Price USD" name="retailPrice" required type="number" step="0.01" defaultValue={money(product?.priceCents)} />
        <Field label="Compare-at Price USD" name="compareAtPrice" type="number" step="0.01" defaultValue={money(product?.compareAtPriceCents)} />
        <Field label="Wholesale Price USD" name="wholesalePrice" type="number" step="0.01" defaultValue={money(product?.wholesalePriceCents)} />
        <Field label="Cost Price USD" name="costPrice" type="number" step="0.01" defaultValue={money(product?.costPriceCents)} />
        <label className="grid gap-2 text-sm font-bold">
          Currency
          <select name="currency" defaultValue="usd" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="usd">USD</option>
          </select>
        </label>
        <Checkbox label="Allow Coupons" name="allowCoupons" defaultChecked={product?.allowCoupons !== false} />
      </Section>

      <Section title="Inventory and Shipping">
        <Field label="Current Stock" name="stock" required type="number" defaultValue={String(product?.stock ?? 0)} />
        <Field label="Low Stock Threshold" name="lowStockThreshold" required type="number" defaultValue={String(product?.lowStockThreshold ?? 5)} />
        <Field label="Weight Grams" name="weightGrams" type="number" defaultValue={String(product?.weightGrams || "")} />
        <Field label="Length mm" name="lengthMm" type="number" defaultValue={String(product?.lengthMm || "")} />
        <Field label="Width mm" name="widthMm" type="number" defaultValue={String(product?.widthMm || "")} />
        <Field label="Height mm" name="heightMm" type="number" defaultValue={String(product?.heightMm || "")} />
      </Section>

      <Section title="Images">
        <Field label="Main Image URL" name="image" defaultValue={product?.image} />
        <Textarea
          label="Gallery Images"
          name="imagesText"
          defaultValue={images(product?.images)}
          placeholder="https://example.com/image.jpg | Alt text | primary"
        />
      </Section>

      <Section title="Kit and Compatibility">
        <Textarea label="Tags" name="tagsText" defaultValue={list(product?.tags)} placeholder="Best Seller&#10;For 168F" />
        <Textarea label="Kit Includes" name="kitIncludesText" defaultValue={list(product?.kitIncludes)} placeholder="Carburetor x1&#10;Spark plug x1" />
        <Textarea label="Compatible Models" name="compatibleModelsText" defaultValue={list(product?.compatibleModels)} placeholder="168F&#10;GX160" />
        <Textarea label="Compatible Equipment" name="compatibleEquipmentText" defaultValue={list(product?.compatibleEquipment)} placeholder="Portable generator&#10;Gasoline water pump" />
        <Textarea label="Problems Solved" name="problemsSolvedText" defaultValue={list(product?.problemsSolved)} placeholder="Engine won't start&#10;Hard starting" />
        <Textarea label="Not Compatible With" name="notCompatibleWithText" defaultValue={list(product?.notCompatibleWith)} />
        <Textarea label="Specifications" name="specificationsText" defaultValue={specs(product?.specifications)} placeholder="Material: Metal + Rubber" />
        <Textarea label="FAQ" name="faqsText" defaultValue={faqs(product?.faqs)} placeholder="Is checkout available? | Yes, Stripe Checkout is available." />
      </Section>

      <Section title="SEO">
        <Field label="SEO Title" name="seoTitle" defaultValue={product?.seoTitle} />
        <Textarea label="SEO Description" name="seoDescription" defaultValue={product?.seoDescription} />
        <Field label="SEO Keywords" name="seoKeywords" defaultValue={product?.seoKeywords} />
        <Field label="Open Graph Image" name="ogImage" defaultValue={product?.ogImage} />
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
