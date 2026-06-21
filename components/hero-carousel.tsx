"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

export type HeroSlide = {
  badge: string;
  title: string;
  subtitle: string;
  image?: string | null;
  linkHref?: string | null;
  primary: { label: string; href: string; external?: boolean; whatsapp?: boolean };
  secondary?: { label: string; href: string };
  panelTitle: string;
  bullets: string[];
};

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  const slide = slides[index];
  const hasImage = Boolean(slide.image);
  const hasPanel = Boolean(slide.panelTitle);

  return (
    // translate="no" + notranslate: opt this autoplaying region out of browser
    // auto-translate, which rewrites text nodes and crashes React's slide-swap
    // (removeChild NotFoundError). Hero copy is already localized via our i18n.
    <section
      translate="no"
      className={`${hasImage ? "" : "hero-gradient"} notranslate relative overflow-hidden px-4 py-20 text-white`}
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Background promo image + dark gradient so left-side copy stays legible. */}
      {hasImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.image as string} alt="" aria-hidden className="absolute inset-0 z-0 h-full w-full object-cover" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0b2545]/85 via-[#0b2545]/55 to-[#0b2545]/20" />
        </>
      )}

      {/* Whole-slide click target (sits above the background, below the content/buttons). */}
      {slide.linkHref && (
        <Link href={slide.linkHref} aria-label={slide.title} className="absolute inset-0 z-10" />
      )}

      <div
        key={index}
        className={`animate-fade relative z-20 mx-auto grid max-w-7xl gap-10 ${hasPanel ? "lg:grid-cols-[1fr_440px] lg:items-center" : ""}`}
      >
        <div>
          {slide.badge && (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#9cc0ff] ring-1 ring-white/15">
              {slide.badge}
            </p>
          )}
          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] text-white md:text-6xl">{slide.title}</h1>
          {slide.subtitle && <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{slide.subtitle}</p>}
          {(slide.primary.label || slide.secondary) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {slide.primary.label &&
                (slide.primary.external ? (
                  <a
                    href={slide.primary.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-20 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-black text-navy shadow-lg transition hover:bg-[#eaf0fb]"
                  >
                    {slide.primary.whatsapp && <MessageCircle size={18} />} {slide.primary.label}
                  </a>
                ) : (
                  <Link
                    href={slide.primary.href}
                    className="relative z-20 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-black text-navy shadow-lg transition hover:bg-[#eaf0fb]"
                  >
                    {slide.primary.label} <ArrowRight size={18} />
                  </Link>
                ))}
              {slide.secondary && (
                <Link
                  href={slide.secondary.href}
                  className="relative z-20 inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 font-black text-white transition hover:bg-white/10"
                >
                  {slide.secondary.label} <ArrowRight size={18} />
                </Link>
              )}
            </div>
          )}
        </div>

        {hasPanel && (
          <div className="rounded-2xl bg-white p-6 text-ink shadow-card-lg">
            <h2 className="text-xl font-black text-[#0b2545]">{slide.panelTitle}</h2>
            <div className="mt-5 grid gap-3">
              {slide.bullets.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-[#f5f8fd] p-4 font-bold">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-brand" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="relative z-20 mx-auto mt-10 flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => go(i)}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/40 text-white transition hover:bg-white/15"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/40 text-white transition hover:bg-white/15"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
