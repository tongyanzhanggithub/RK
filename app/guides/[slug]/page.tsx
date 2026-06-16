import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle, PlayCircle } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { whatsappLink } from "@/lib/contact";
import { prisma } from "@/lib/db";
import { getServerDict } from "@/lib/locale";
import { breadcrumbLd } from "@/lib/seo";
import { youtubeEmbedUrl } from "@/lib/video";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const guides = await prisma.repairGuide.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true }
  });
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = await prisma.repairGuide.findUnique({ where: { slug: params.slug } });
  if (!guide || guide.status !== "PUBLISHED") return {};
  return {
    title: guide.seoTitle || guide.title,
    description: guide.seoDescription || guide.excerpt || undefined,
    openGraph: {
      title: guide.seoTitle || guide.title,
      description: guide.seoDescription || guide.excerpt || undefined
    }
  };
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const dict = getServerDict();
  const g = dict.guides;
  const guide = await prisma.repairGuide.findUnique({ where: { slug: params.slug } });
  if (!guide || guide.status !== "PUBLISHED") notFound();

  const inquiry = whatsappLink(`Hello, I read your guide "${guide.title}" and need the parts. Can you send a quote?`);
  const embedUrl = guide.videoUrl ? youtubeEmbedUrl(guide.videoUrl) : null;

  const breadcrumb = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: g.back_to_guides, path: "/guides" },
    { name: guide.title, path: `/guides/${guide.slug}` }
  ]);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt || undefined,
    datePublished: guide.createdAt.toISOString(),
    dateModified: guide.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "RepairKit Supply" },
    publisher: { "@type": "Organization", name: "RepairKit Supply" }
  };

  return (
    <main className="px-4 py-10">
      <JsonLd data={breadcrumb} />
      <JsonLd data={articleLd} />
      <article className="mx-auto max-w-3xl">
        <nav className="text-sm font-bold text-steel">
          <Link href="/guides" className="hover:text-navy">
            {g.back_to_guides}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{guide.title}</span>
        </nav>

        <p className="mt-4 font-black uppercase text-safety">{g.badge}</p>
        <h1 className="mt-1 text-4xl font-black leading-tight">{guide.title}</h1>
        {guide.excerpt && <p className="mt-3 text-lg leading-8 text-steel">{guide.excerpt}</p>}

        {embedUrl && (
          <div className="mt-8">
            <h2 className="inline-flex items-center gap-2 text-xl font-black">
              <PlayCircle className="text-navy" size={22} /> {g.video_heading}
            </h2>
            <div className="mt-3 aspect-video">
              <iframe
                src={embedUrl}
                title={`${guide.title} video`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )}

        {guide.content && (
          <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-ink">{guide.content}</div>
        )}

        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 border border-line bg-panel p-6">
          <p className="font-bold leading-6 text-steel">{g.related_help}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={inquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 bg-safety px-5 font-black text-ink"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 border border-navy px-5 font-black text-navy hover:bg-white"
            >
              {dict.common.view_catalog} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
