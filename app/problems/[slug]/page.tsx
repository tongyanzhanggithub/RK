import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, Cog, Gauge, Hammer, MessageCircle, PlayCircle, Wrench } from "lucide-react";
import { DiagnosticTree } from "@/components/diagnostic-tree";
import { ProblemFeedback } from "@/components/problem-feedback";
import { ProductCard } from "@/components/product-card";
import { problems } from "@/data/problems";
import { getModel } from "@/data/models";
import { whatsappLink } from "@/lib/contact";
import { getServerDict } from "@/lib/locale";
import { getStoreProducts } from "@/lib/product-store";
import { getTroubleshooting, getTroubleshootingGuide } from "@/lib/troubleshooting";
import { youtubeEmbedUrl } from "@/lib/video";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return problems.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const problem = await getTroubleshootingGuide(params.slug);
  if (!problem) return {};
  return {
    title: `${problem.title} — Causes, Checks & Repair Kits`,
    description: `${problem.description} See common causes, quick field checks and the repair kits that fix it.`
  };
}

export default async function ProblemPage({ params }: { params: { slug: string } }) {
  const problem = await getTroubleshootingGuide(params.slug);
  if (!problem) notFound();

  const dict = getServerDict();
  const pr = dict.problems;
  const difficultyLabel = {
    easy: pr.difficulty_easy,
    moderate: pr.difficulty_moderate,
    advanced: pr.difficulty_advanced
  }[problem.difficulty];
  const difficultyColor = {
    easy: "bg-green-100 text-green-800",
    moderate: "bg-amber-100 text-amber-800",
    advanced: "bg-red-100 text-red-800"
  }[problem.difficulty];
  const embedUrl = problem.videoUrl ? youtubeEmbedUrl(problem.videoUrl) : null;

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

  const productNames: Record<string, string> = {};
  for (const product of products) productNames[product.slug] = product.name;

  const affectedModels = (problem.affectedModels || [])
    .map((slug) => getModel(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof getModel>>[];

  const allProblems = await getTroubleshooting();
  const otherProblems = allProblems.filter((item) => item.slug !== problem.slug).slice(0, 3);
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
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-black ${difficultyColor}`}>
                <Gauge size={15} /> {pr.difficulty_label}: {difficultyLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-panel px-3 py-1.5 text-sm font-black text-graphite">
                <Clock3 size={15} /> {pr.time_label}: {problem.timeEstimate}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-steel">{problem.description}</p>

            {problem.decisionTree && (
              <div className="mt-8">
                <DiagnosticTree
                  tree={problem.decisionTree}
                  productNames={productNames}
                  strings={{
                    heading: pr.diagnose_heading,
                    intro: pr.diagnose_intro,
                    start: pr.diagnose_start,
                    restart: pr.diagnose_restart,
                    back: pr.diagnose_back,
                    result_cause: pr.diagnose_result_cause,
                    result_action: pr.diagnose_result_action,
                    result_parts: pr.diagnose_result_parts
                  }}
                />
              </div>
            )}

            {affectedModels.length > 0 && (
              <section className="mt-6 border border-line bg-white p-6">
                <h2 className="inline-flex items-center gap-2 text-xl font-black">
                  <Cog className="text-navy" size={22} /> {pr.affected_heading}
                </h2>
                <p className="mt-1 text-sm text-steel">{pr.affected_sub}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {affectedModels.map((model) => (
                    <Link
                      key={model.slug}
                      href={`/engines/${model.slug}`}
                      className="inline-flex items-center gap-1.5 border border-line bg-panel px-3 py-2 text-sm font-black hover:border-navy"
                    >
                      {model.name} <ArrowRight size={14} className="text-navy" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6 border border-line bg-white p-6">
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

            {embedUrl && (
              <section className="mt-6 border border-line bg-white p-6">
                <h2 className="inline-flex items-center gap-2 text-xl font-black">
                  <PlayCircle className="text-navy" size={22} /> {pr.video_heading}
                </h2>
                <p className="mt-1 text-sm text-steel">{pr.video_note}</p>
                <div className="mt-4 aspect-video">
                  <iframe
                    src={embedUrl}
                    title={`${problem.title} repair video`}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </section>
            )}

            <section className="mt-6 border border-line bg-white p-6">
              <h2 className="inline-flex items-center gap-2 text-xl font-black">
                <Hammer className="text-navy" size={22} /> {pr.tools_heading}
              </h2>
              <p className="mt-1 text-sm text-steel">{pr.tools_note}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {problem.toolsNeeded.map((tool) => (
                  <li key={tool} className="border border-line bg-panel px-3 py-2 text-sm font-bold">
                    {tool}
                  </li>
                ))}
              </ul>
            </section>

            <ProblemFeedback
              strings={{
                question: pr.feedback_q,
                yes: pr.feedback_yes,
                no: pr.feedback_no,
                thanks_yes: pr.feedback_thanks_yes,
                thanks_no: pr.feedback_thanks_no
              }}
            />
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
              {recommended.map((product, index) => (
                <div key={product.slug} className="relative">
                  {index === 0 && (
                    <span className="absolute -top-3 left-4 z-10 bg-safety px-3 py-1 text-xs font-black uppercase text-ink">
                      {pr.best_match}
                    </span>
                  )}
                  <ProductCard product={product} />
                </div>
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
