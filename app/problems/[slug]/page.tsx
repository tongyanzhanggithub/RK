import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, CircleAlert, MessageCircle, Wrench } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { problems, getProblem } from "@/data/problems";
import { whatsappLink } from "@/lib/contact";
import { getStoreProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return problems.map((problem) => ({ slug: problem.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const problem = getProblem(params.slug);
  if (!problem) return {};
  return {
    title: `${problem.title} — Causes, Checks & Repair Kits`,
    description: `${problem.description} See common causes, quick field checks and the repair kits that fix it.`
  };
}

export default async function ProblemPage({ params }: { params: { slug: string } }) {
  const problem = getProblem(params.slug);
  if (!problem) notFound();

  const products = await getStoreProducts();
  const recommendedBySlug = problem.recommendedProductSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter(Boolean);
  const recommendedByTag = products.filter(
    (product) =>
      product.problemsSolved.includes(problem.title) &&
      !problem.recommendedProductSlugs.includes(product.slug)
  );
  const recommended = [...recommendedBySlug, ...recommendedByTag].slice(0, 6) as NonNullable<
    (typeof recommendedBySlug)[number]
  >[];

  const otherProblems = problems.filter((item) => item.slug !== problem.slug).slice(0, 3);
  const inquiry = whatsappLink(
    `Hello, my machine has this problem: ${problem.title}. Can you help me find the right repair kit? I can send photos.`
  );

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <nav className="text-sm font-bold text-steel">
          <Link href="/problems" className="hover:text-navy">Troubleshooting</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{problem.title}</span>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="font-black uppercase text-safety">Fix by symptom</p>
            <h1 className="mt-1 text-4xl font-black">{problem.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-steel">{problem.description}</p>

            <section className="mt-8 border border-line bg-white p-6">
              <h2 className="inline-flex items-center gap-2 text-xl font-black">
                <CircleAlert className="text-safety" size={22} /> Common causes
              </h2>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {problem.commonCauses.map((cause) => (
                  <li key={cause} className="border border-line bg-panel px-4 py-3 font-bold">
                    {cause}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6 border border-line bg-white p-6">
              <h2 className="inline-flex items-center gap-2 text-xl font-black">
                <Wrench className="text-navy" size={22} /> Check these before ordering
              </h2>
              <ol className="mt-4 grid gap-3">
                {problem.checkSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center bg-navy text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 font-bold">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="h-fit border border-line bg-panel p-6">
            <h2 className="text-lg font-black">Not sure about the cause?</h2>
            <p className="mt-2 text-sm leading-6 text-steel">
              Send a photo or short video of the machine on WhatsApp. We confirm the engine model and recommend the
              exact kit — usually within the same day.
            </p>
            <a
              href={inquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 bg-safety px-5 font-black text-ink"
            >
              <MessageCircle size={18} /> Diagnose via WhatsApp
            </a>
            <div className="mt-6 border-t border-line pt-4">
              <h3 className="text-sm font-black uppercase text-steel">Other symptoms</h3>
              <ul className="mt-2 grid gap-1">
                {otherProblems.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/problems/${item.slug}`} className="inline-flex items-center gap-1 font-bold text-navy hover:underline">
                      {item.title} <ArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <div className="mb-6">
            <p className="font-black uppercase text-safety">Recommended fix</p>
            <h2 className="inline-flex items-center gap-2 text-3xl font-black">
              <CheckCircle2 className="text-navy" size={28} /> Kits that solve this problem
            </h2>
          </div>
          {recommended.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommended.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <p className="border border-line bg-white p-6 font-bold text-steel">
              No kit is mapped to this symptom yet — contact us on WhatsApp and we will quote the right parts.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
