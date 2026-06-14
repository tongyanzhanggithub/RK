import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { InquiryButton } from "@/components/inquiry-button";
import { formatMoney } from "@/lib/format";
import { getStoreProduct, getStoreProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getStoreProduct(params.slug);
  if (!product) return {};
  return {
    title: product.seoTitle || `${product.name} | ${product.category}`,
    description: product.seoDescription || product.shortDescription
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getStoreProduct(params.slug);
  if (!product) notFound();
  const relatedProducts = (await getStoreProducts()).filter((item) => item.slug !== product.slug && item.category === product.category).slice(0, 3);

  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const productImage = product.images?.find((image) => image.isPrimary)?.url || product.images?.[0]?.url || product.image;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(productImage ? { image: productImage.startsWith("http") ? productImage : `${SITE_URL}${productImage}` } : {}),
    category: product.category,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: product.currency.toUpperCase(),
      price: (product.priceCents / 100).toFixed(2),
      availability: (product.stock ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition"
    }
  };

  return (
    <main className="px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl">
        <Link href="/products" className="font-bold text-navy">Back to products</Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid min-h-[420px] place-items-center border border-line bg-white industrial-grid">
            <span className="text-6xl font-black text-navy">KIT</span>
          </div>
          <div>
            <p className="font-black uppercase text-safety">{product.category}</p>
            <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
            <p className="mt-4 text-lg leading-8 text-steel">{product.shortDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => <span key={tag} className="bg-safety/15 px-3 py-1 text-sm font-black">{tag}</span>)}
            </div>
            <div className="mt-6">
              <p className="text-sm font-black uppercase text-steel">Retail reference</p>
              <p className="text-3xl font-black">{formatMoney(product.priceCents, product.currency)}</p>
              <p className="mt-1 text-sm font-bold text-navy">Wholesale price by volume — request a quote below</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <InquiryButton name={product.name} sku={product.sku} url={productUrl} className="min-w-52" />
              <AddToCartButton slug={product.slug} name={product.name} className="min-w-44" />
            </div>
            <p className="mt-3 text-sm font-bold text-steel">
              Wholesale buyers: chat on WhatsApp for MOQ, carton plan and T/T pricing. The cart is for small trial orders by card.
            </p>
            <p className="mt-5 border-l-4 border-safety bg-panel p-4 text-sm font-bold">
              Compatibility note: confirm model label, dimensions, wiring, carburetor shape or recoil starter mounting before ordering.
            </p>
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <InfoBlock title="Compatible Models" items={product.compatibleModels} />
          <InfoBlock title="Compatible Equipment" items={product.compatibleEquipment} />
          <InfoBlock title="Problems Solved" items={product.problemsSolved} />
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="border border-line bg-white p-6">
            <h2 className="text-2xl font-black">Kit Includes</h2>
            <ul className="mt-4 grid gap-2">
              {product.kitIncludes.map((item) => <li key={item} className="border-b border-line pb-2">{item}</li>)}
            </ul>
          </div>
          {product.compatibleModels.length > 0 && (
            <div className="border border-line bg-white p-6">
              <h2 className="text-2xl font-black">Compatibility Table</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-panel">
                    <tr>
                      <th className="p-3">Engine Model</th>
                      <th className="p-3">Compatible Equipment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.compatibleModels.map((model) => (
                      <tr key={model} className="border-b border-line">
                        <td className="p-3 font-bold">{model}</td>
                        <td className="p-3">{product.compatibleEquipment.join(", ") || "See product description"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {product.notCompatibleWith && product.notCompatibleWith.length > 0 && (
            <InfoBlock title="Not Compatible With" items={product.notCompatibleWith} />
          )}
          {product.specifications && product.specifications.length > 0 && (
            <InfoBlock title="Specifications" items={product.specifications.map((item) => `${item.label}: ${item.value}`)} />
          )}
          {product.faqs && product.faqs.length > 0 && (
            <InfoBlock title="FAQ" items={product.faqs.map((faq) => `${faq.question} ${faq.answer}`)} />
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black">Recommended Matching Products</h2>
          <div className="mt-4 grid gap-3">
            {relatedProducts.map((item) => <Link key={item.slug} href={`/products/${item.slug}`} className="border border-line bg-white p-4 font-bold">{item.name}</Link>)}
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-line bg-white p-6">
      <h2 className="text-xl font-black">{title}</h2>
      <ul className="mt-4 grid gap-2 text-sm text-steel">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </div>
  );
}
