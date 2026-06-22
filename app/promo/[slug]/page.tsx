import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/db";
import { getStoreProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

async function loadLiveCampaign(slug: string) {
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign || !campaign.isActive) return null;
  const now = new Date();
  if (campaign.startsAt && campaign.startsAt > now) return null;
  if (campaign.endsAt && campaign.endsAt < now) return null;
  return campaign;
}

function parseSlugs(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const campaign = await loadLiveCampaign(params.slug);
  if (!campaign) return { title: "活动已结束" };
  return {
    title: campaign.seoTitle || campaign.title,
    description: campaign.seoDescription || campaign.subtitle || undefined,
    openGraph: {
      title: campaign.seoTitle || campaign.title,
      description: campaign.seoDescription || campaign.subtitle || undefined,
      images: campaign.heroImage ? [campaign.heroImage] : undefined
    }
  };
}

export default async function PromoPage({ params }: { params: { slug: string } }) {
  const campaign = await loadLiveCampaign(params.slug);
  if (!campaign) notFound();

  const wanted = parseSlugs(campaign.productSlugs);
  let products: Awaited<ReturnType<typeof getStoreProducts>> = [];
  if (wanted.length > 0) {
    const all = await getStoreProducts();
    const bySlug = new Map(all.map((p) => [p.slug, p]));
    // Preserve the admin-chosen order.
    products = wanted.map((s) => bySlug.get(s)).filter((p): p is (typeof all)[number] => Boolean(p));
  }

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        {campaign.heroImage && (
          <Image
            src={campaign.heroImage}
            alt={campaign.title}
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-30"
          />
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">{campaign.title}</h1>
          {campaign.subtitle && <p className="mt-4 max-w-2xl text-lg leading-7 text-white/80">{campaign.subtitle}</p>}
          {campaign.ctaLabel && campaign.ctaHref && (
            <Link
              href={campaign.ctaHref}
              className="mt-8 inline-flex h-12 items-center gap-2 bg-brand px-6 font-black text-white hover:bg-[#1c54bf]"
            >
              {campaign.ctaLabel} <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* Body */}
      {campaign.bodyHtml && (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <div
            className="prose prose-slate max-w-none leading-7 [&_a]:text-brand [&_h2]:font-black [&_h3]:font-black"
            dangerouslySetInnerHTML={{ __html: campaign.bodyHtml }}
          />
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <h2 className="mb-6 text-2xl font-black">活动产品</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      {campaign.ctaLabel && campaign.ctaHref && (
        <section className="border-t border-line bg-panel py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center">
            <p className="text-xl font-black">{campaign.subtitle || campaign.title}</p>
            <Link
              href={campaign.ctaHref}
              className="inline-flex h-12 items-center gap-2 bg-brand px-6 font-black text-white hover:bg-[#1c54bf]"
            >
              {campaign.ctaLabel} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
