import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleAlert, MessageCircle } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SetMyEngineButton } from "@/components/set-my-engine-button";
import { models, getModel } from "@/data/models";
import { whatsappLink } from "@/lib/contact";
import { getStoreProducts } from "@/lib/product-store";
import { getTroubleshooting } from "@/lib/troubleshooting";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return models.map((model) => ({ slug: model.slug }));
}

function specificPartsFor(products: Awaited<ReturnType<typeof getStoreProducts>>, modelName: string) {
  const needle = modelName.toLowerCase();
  return products.filter(
    (product) =>
      product.fitmentType !== "UNIVERSAL" &&
      (product.compatibleModels.some((item) => item.toLowerCase().includes(needle)) ||
        product.compatibleEquipment.some((item) => item.toLowerCase().includes(needle)))
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const model = getModel(params.slug);
  if (!model) return {};
  const products = await getStoreProducts();
  const count = specificPartsFor(products, model.name).length;
  const countText = count > 0 ? `${count} compatible repair kits & spare parts in stock. ` : "";
  return {
    title: `${model.name} Parts & Repair Kits${count > 0 ? ` (${count} in stock)` : ""}`,
    description: `${countText}${model.description} Factory-direct, wholesale pricing, fitment confirmed before you order.`
  };
}

export default async function EngineModelPage({ params }: { params: { slug: string } }) {
  const model = getModel(params.slug);
  if (!model) notFound();

  const products = await getStoreProducts();
  const specificParts = specificPartsFor(products, model.name);
  const universalParts = products.filter((product) => product.fitmentType === "UNIVERSAL");

  const problems = await getTroubleshooting();
  const relatedProblems = problems.filter(
    (problem) =>
      problem.affectedModels?.includes(model.slug) ||
      model.commonProblems.some((title) => title.toLowerCase() === problem.title.toLowerCase())
  );

  const inquiry = whatsappLink(
    `Hello, I need parts for a ${model.name}. Can you confirm fitment and send a quote? I can share photos of the machine.`
  );

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <nav className="text-sm font-bold text-steel">
          <Link href="/engines" className="hover:text-navy">Engines</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{model.name}</span>
        </nav>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-black uppercase text-safety">Shop by engine</p>
            <h1 className="mt-1 text-4xl font-black">{model.name} parts &amp; repair kits</h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-steel">{model.description}</p>
            <p className="mt-2 text-sm font-bold text-steel">
              Commonly used in: {model.commonEquipment.join(" · ")}
            </p>
          </div>
          <SetMyEngineButton modelName={model.name} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard value={specificParts.length} label={`parts confirmed for ${model.name}`} tone="navy" />
          <StatCard value={universalParts.length} label="universal parts that also fit" tone="plain" />
          <StatCard value={specificParts.length + universalParts.length} label="total parts available" tone="plain" />
        </div>

        <div className="mt-6 flex items-start gap-3 border border-safety/60 bg-safety/10 p-4">
          <CircleAlert className="mt-0.5 shrink-0 text-ink" size={20} />
          <p className="font-bold leading-6">
            <span className="font-black uppercase">Before you order:</span> {model.compatibilityNote}{" "}
            <a href={inquiry} target="_blank" rel="noopener noreferrer" className="font-black text-navy underline">
              Confirm fitment on WhatsApp
            </a>
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-black">Parts made for {model.name}</h2>
          {specificParts.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {specificParts.map((product) => (
                <ProductCard key={product.slug} product={product} activeModel={model.name} />
              ))}
            </div>
          ) : (
            <p className="mt-4 border border-line bg-white p-6 font-bold text-steel">
              No kit is mapped to this model yet — message us on WhatsApp and we will quote the right parts.
            </p>
          )}
        </section>

        {universalParts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-black">Universal parts that also fit</h2>
            <p className="mt-1 text-steel">These parts fit nearly all small gasoline engines — check the spec note on each card.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {universalParts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        )}

        {relatedProblems.length > 0 && (
          <section className="mt-10 border border-line bg-panel p-6">
            <h2 className="text-xl font-black">Common {model.name} problems</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {relatedProblems.map((problem) => (
                <Link
                  key={problem.slug}
                  href={`/problems/${problem.slug}`}
                  className="group border border-line bg-white p-4 hover:border-navy"
                >
                  <strong className="block leading-snug">{problem.title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-steel">{problem.description}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-black text-navy">
                    Diagnose &amp; fix <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 bg-ink p-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Buying {model.name} parts in volume?</h2>
              <p className="mt-1 text-white/75">Wholesale pricing, mixed cartons and OEM packaging available.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={inquiry}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 bg-safety px-5 font-black text-ink"
              >
                <MessageCircle size={18} /> WhatsApp Quote
              </a>
              <Link href="/wholesale" className="inline-flex h-12 items-center gap-2 border border-white/40 px-5 font-black text-white hover:bg-white/10">
                Apply for Wholesale <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ value, label, tone }: { value: number; label: string; tone: "navy" | "plain" }) {
  return (
    <div className={`border p-4 ${tone === "navy" ? "border-navy bg-navy text-white" : "border-line bg-white"}`}>
      <strong className="block text-3xl font-black leading-none">{value}</strong>
      <span className={`mt-1 block text-sm font-bold ${tone === "navy" ? "text-white/80" : "text-steel"}`}>{label}</span>
    </div>
  );
}
