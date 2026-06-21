import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToQuoteButton } from "@/components/add-to-quote-button";
import { FaqAccordion } from "@/components/faq-accordion";
import { FitmentChecker } from "@/components/fitment-checker";
import { RecentlyViewed } from "@/components/recently-viewed";
import { InquiryButton } from "@/components/inquiry-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { QuantityAddToCart } from "@/components/quantity-add-to-cart";
import { StockStatus } from "@/components/stock-status";
import { Stars } from "@/components/stars";
import { TrustBadges } from "@/components/trust-badges";
import { ReviewForm } from "./review-form";
import { getProduct } from "@/data/products";
import { engineHrefForModelText, problemHrefForTitle } from "@/lib/discovery-links";
import { JsonLd, jsonLdString } from "@/components/json-ld";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getServerDict } from "@/lib/locale";
import { getServerCountry } from "@/lib/region-server";
import { Price } from "@/components/price";
import { getStoreProduct, getStoreProducts } from "@/lib/product-store";
import { breadcrumbLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getStoreProduct(params.slug);
  if (!product) return {};
  const title = product.seoTitle || `${product.name} | ${product.category}`;
  const description = product.seoDescription || product.shortDescription;
  const ogImage = product.ogImage || product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || product.image;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/products/${product.slug}`,
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {})
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {})
    }
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const dict = getServerDict();
  const shipCountry = getServerCountry();
  const product = await getStoreProduct(params.slug);
  if (!product) notFound();
  const allProducts = await getStoreProducts();

  const relatedGuideSlugs = getProduct(product.slug)?.relatedGuideSlugs ?? [];
  const relatedGuides = relatedGuideSlugs.length
    ? await prisma.repairGuide.findMany({
        where: { slug: { in: relatedGuideSlugs }, status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" }
      })
    : [];
  const relatedProducts = allProducts
    .filter((item) => item.slug !== product.slug)
    .map((item) => {
      const modelOverlap = item.compatibleModels.filter((model) => product.compatibleModels.includes(model)).length;
      const score =
        modelOverlap * 3 +
        (item.fitmentType === "UNIVERSAL" ? 2 : 0) +
        (item.category === product.category ? 1 : 0);
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }) => item);

  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const productImage = product.images?.find((image) => image.isPrimary)?.url || product.images?.[0]?.url || product.image;
  const outOfStock = (product.stock ?? 0) <= 0;
  const reviews = await prisma.productReview.findMany({
    where: { productSlug: product.slug, isPublished: true },
    orderBy: { createdAt: "desc" }
  });
  const reviewCount = reviews.length;
  const avgRating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
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
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition"
    },
    ...(reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount } }
      : {})
  };
  const breadcrumb = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: product.name, path: `/products/${product.slug}` }
  ]);
  const faqLd =
    product.faqs && product.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: product.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer }
          }))
        }
      : null;

  return (
    <main className="px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <JsonLd data={breadcrumb} />
      {faqLd && <JsonLd data={faqLd} />}
      <div className="mx-auto max-w-7xl">
        <Link href="/products" className="font-bold text-navy">{dict.common.back_to_products}</Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ProductGallery product={product} />
          <div>
            <p className="font-black uppercase text-brand">{product.category}</p>
            <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
            {reviewCount > 0 && (
              <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-steel hover:text-navy">
                <Stars rating={avgRating} /> {avgRating.toFixed(1)} ({reviewCount})
              </a>
            )}
            <p className="mt-4 text-lg leading-8 text-steel">{product.shortDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => <span key={tag} className="bg-brand/15 px-3 py-1 text-sm font-black">{tag}</span>)}
            </div>
            <div className="mt-6">
              <FitmentChecker
                productName={product.name}
                sku={product.sku}
                productUrl={productUrl}
                compatibleModels={product.compatibleModels}
                notCompatibleWith={product.notCompatibleWith}
                fitmentType={product.fitmentType}
                fitmentNote={product.fitmentNote}
                guaranteed={product.fitmentGuaranteed}
              />
            </div>
            <div className="mt-6">
              <p className="text-sm font-black uppercase text-steel">{dict.product.retail_label}</p>
              <p className="flex flex-wrap items-baseline gap-3">
                <Price cents={product.priceCents} showUsd className="text-3xl font-black" />
                {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                  <>
                    <span className="text-lg font-bold text-steel line-through">
                      {formatMoney(product.compareAtPriceCents, product.currency)}
                    </span>
                    <span className="bg-red-100 px-2 py-0.5 text-sm font-black text-red-800">
                      {dict.product.save_pct.replace("{n}", String(Math.round((1 - product.priceCents / product.compareAtPriceCents) * 100)))}
                    </span>
                  </>
                )}
              </p>
              <p className="mt-1 text-sm font-bold text-navy">{dict.product.wholesale_note}</p>
              {shipCountry.vat && <p className="mt-1 text-xs text-steel">{shipCountry.vat}.</p>}
              <StockStatus stock={product.stock} lowStockThreshold={product.lowStockThreshold} className="mt-2" />
            </div>
            <div className="mt-5 grid gap-3">
              <QuantityAddToCart
                slug={product.slug}
                name={product.name}
                outOfStock={outOfStock}
                maxQuantity={product.stock ?? 99}
              />
              <div className="flex flex-wrap gap-3">
                <AddToQuoteButton slug={product.slug} name={product.name} className="min-w-52 justify-self-start" />
                <InquiryButton name={product.name} sku={product.sku} url={productUrl} className="min-w-52 justify-self-start" />
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-steel">{dict.product.wholesale_buyers}</p>
            <TrustBadges className="mt-5 border-t border-line pt-4 sm:grid-cols-2" />
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <LinkedInfoBlock
            title={dict.product.compatible_models}
            items={product.compatibleModels.map((model) => ({ label: model, href: engineHrefForModelText(model) }))}
          />
          <LinkedInfoBlock
            title={dict.product.compatible_equipment}
            items={product.compatibleEquipment.map((item) => ({ label: item, href: null }))}
          />
          <LinkedInfoBlock
            title={dict.product.problems_solved}
            items={product.problemsSolved.map((problem) => ({ label: problem, href: problemHrefForTitle(problem) }))}
          />
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="border border-line bg-white p-6">
            <h2 className="text-2xl font-black">{dict.product.kit_includes}</h2>
            <ul className="mt-4 grid gap-2">
              {product.kitIncludes.map((item) => <li key={item} className="border-b border-line pb-2">{item}</li>)}
            </ul>
          </div>
          {product.compatibleModels.length > 0 && (
            <div className="border border-line bg-white p-6">
              <h2 className="text-2xl font-black">{dict.product.compatibility_table}</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-panel">
                    <tr>
                      <th className="p-3">{dict.product.engine_model_col}</th>
                      <th className="p-3">{dict.product.compatible_equipment_col}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.compatibleModels.map((model) => {
                      const href = engineHrefForModelText(model);
                      return (
                        <tr key={model} className="border-b border-line">
                          <td className="p-3 font-bold">
                            {href ? (
                              <Link href={href} className="text-navy underline-offset-2 hover:underline">
                                {model}
                              </Link>
                            ) : (
                              model
                            )}
                          </td>
                          <td className="p-3">{product.compatibleEquipment.join(", ") || dict.product.see_description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {product.notCompatibleWith && product.notCompatibleWith.length > 0 && (
            <LinkedInfoBlock
              title={dict.product.not_compatible}
              items={product.notCompatibleWith.map((item) => ({ label: item, href: null }))}
            />
          )}
          {product.specifications && product.specifications.length > 0 && (
            <LinkedInfoBlock
              title="Specifications"
              items={product.specifications.map((item) => ({ label: `${item.label}: ${item.value}`, href: null }))}
            />
          )}
          {product.faqs && product.faqs.length > 0 && (
            <FaqAccordion items={product.faqs} />
          )}
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-black">{dict.product.related_title}</h2>
            <p className="mt-1 text-steel">{dict.product.related_sub}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        )}

        {relatedGuides.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-black">{dict.guides.related_title}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group flex flex-col border border-line bg-white p-6 shadow-sm hover:border-navy"
                >
                  <h3 className="text-lg font-black leading-snug">{guide.title}</h3>
                  {guide.excerpt && <p className="mt-2 text-sm leading-6 text-steel">{guide.excerpt}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 font-black text-navy">{dict.guides.read_more}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="reviews" className="mt-10 border-t border-line pt-8">
          <h2 className="text-2xl font-black">{dict.product.reviews_title}</h2>
          {reviewCount > 0 ? (
            <div className="mt-2 flex items-center gap-3">
              <Stars rating={avgRating} size={20} />
              <span className="font-black">{avgRating.toFixed(1)}</span>
              <span className="text-steel">{dict.product.reviews_summary.replace("{n}", String(reviewCount))}</span>
            </div>
          ) : (
            <p className="mt-2 text-steel">{dict.product.no_reviews}</p>
          )}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="grid gap-4">
              {reviews.map((r) => (
                <article key={r.id} className="border border-line bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-steel">
                      {r.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {r.title && <p className="mt-2 font-black">{r.title}</p>}
                  <p className="mt-1 text-sm leading-6 text-ink">{r.body}</p>
                  <p className="mt-2 text-xs font-bold text-steel">
                    {r.authorName}
                    {r.country ? ` · ${r.country}` : ""}
                  </p>
                </article>
              ))}
            </div>
            <ReviewForm productSlug={product.slug} />
          </div>
        </section>

        <RecentlyViewed
          heading={dict.product.recently_viewed}
          current={{
            slug: product.slug,
            name: product.name,
            image: productImage || null,
            priceCents: product.priceCents,
            currency: product.currency
          }}
        />
      </div>
    </main>
  );
}

function LinkedInfoBlock({ title, items }: { title: string; items: { label: string; href: string | null }[] }) {
  return (
    <div className="border border-line bg-white p-6">
      <h2 className="text-xl font-black">{title}</h2>
      <ul className="mt-4 grid gap-2 text-sm text-steel">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href} className="font-bold text-navy underline-offset-2 hover:underline">
                {item.label}
              </Link>
            ) : (
              <>- {item.label}</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
