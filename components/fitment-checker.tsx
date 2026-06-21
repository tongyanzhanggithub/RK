"use client";

import Link from "next/link";
import { CheckCircle2, CircleAlert, CircleX, Globe, MessageCircle, ShieldCheck } from "lucide-react";
import { engineMatchesModels, useMyEngine } from "@/components/engine-provider";
import { useLanguage } from "@/components/language-provider";
import { models } from "@/data/models";
import { whatsappLink } from "@/lib/contact";

type FitmentCheckerProps = {
  productName: string;
  sku?: string;
  productUrl: string;
  compatibleModels: string[];
  notCompatibleWith?: string[];
  fitmentType?: "SPECIFIC" | "UNIVERSAL";
  fitmentNote?: string;
  guaranteed?: boolean;
};

export function FitmentChecker({
  productName,
  sku,
  productUrl,
  compatibleModels,
  notCompatibleWith,
  fitmentType,
  fitmentNote,
  guaranteed
}: FitmentCheckerProps) {
  const { myEngine, setMyEngine } = useMyEngine();
  const t = useLanguage().dict.fitcheck;

  const confirmLink = whatsappLink(
    [
      t.msg_intro,
      t.msg_product.replace("{name}", productName),
      sku ? t.msg_sku.replace("{sku}", sku) : "",
      myEngine ? t.msg_engine.replace("{m}", myEngine) : t.msg_engine_photo,
      t.msg_link.replace("{url}", productUrl)
    ]
      .filter(Boolean)
      .join("\n")
  );

  if (fitmentType === "UNIVERSAL") {
    return (
      <div className="border border-navy/30 bg-navy/5 p-4">
        <p className="inline-flex items-start gap-2 font-black text-navy">
          <Globe size={18} className="mt-0.5 shrink-0" /> {t.universal_title}
        </p>
        {fitmentNote && <p className="mt-1 pl-6 text-sm font-bold text-steel">{fitmentNote}</p>}
      </div>
    );
  }

  if (!myEngine) {
    return (
      <div className="border border-line bg-panel p-4">
        <p className="font-black">{t.ask_title}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) setMyEngine(event.target.value);
            }}
            aria-label={t.select_label}
            className="h-11 border border-line bg-white px-3 text-sm font-bold outline-none focus:border-navy"
          >
            <option value="" disabled>
              {t.select_placeholder}
            </option>
            {models.map((model) => (
              <option key={model.slug} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
          <a
            href={confirmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 border border-navy px-4 text-sm font-black text-navy hover:bg-white"
          >
            <MessageCircle size={16} /> {t.ask_us}
          </a>
        </div>
      </div>
    );
  }

  const blocked = notCompatibleWith && engineMatchesModels(myEngine, notCompatibleWith);
  const fits = !blocked && engineMatchesModels(myEngine, compatibleModels);

  if (blocked) {
    return (
      <div className="border border-red-200 bg-red-50 p-4">
        <p className="inline-flex items-start gap-2 font-black text-red-800">
          <CircleX size={18} className="mt-0.5 shrink-0" /> {t.not_compat.replace("{m}", myEngine)}
        </p>
        <p className="mt-1 pl-6 text-sm font-bold text-red-800/80">{t.not_compat_body.replace("{m}", myEngine)}</p>
        <a
          href={confirmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-6 mt-2 inline-flex items-center gap-2 text-sm font-black text-navy underline"
        >
          <MessageCircle size={15} /> {t.find_right}
        </a>
      </div>
    );
  }

  if (fits && guaranteed) {
    return (
      <div className="border border-green-600 bg-green-50 p-4">
        <p className="inline-flex items-start gap-2 text-lg font-black text-green-800">
          <ShieldCheck size={22} className="mt-0.5 shrink-0" /> {t.guaranteed_title.replace("{m}", myEngine)}
        </p>
        <p className="mt-1 pl-7 text-sm font-bold text-green-800/90">
          {t.guaranteed_body.replace("{m}", myEngine)}
          <Link href="/guaranteed-fit" className="text-navy underline">
            {t.how_link}
          </Link>
        </p>
        <a href={confirmLink} target="_blank" rel="noopener noreferrer" className="ml-7 mt-2 inline-flex items-center gap-2 text-sm font-black text-navy underline">
          <MessageCircle size={15} /> {t.still_unsure}
        </a>
      </div>
    );
  }

  if (fits) {
    return (
      <div className="border border-green-200 bg-green-50 p-4">
        <p className="inline-flex items-start gap-2 font-black text-green-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {t.fits_title.replace("{m}", myEngine)}
        </p>
        <p className="mt-1 pl-6 text-sm font-bold text-green-800/80">
          {t.fits_body.replace("{m}", myEngine)}
          <a href={confirmLink} target="_blank" rel="noopener noreferrer" className="text-navy underline">
            {t.confirm_wa}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="border border-brand/60 bg-brand/10 p-4">
      <p className="inline-flex items-start gap-2 font-black text-ink">
        <CircleAlert size={18} className="mt-0.5 shrink-0" /> {t.notconfirmed_title.replace("{m}", myEngine)}
      </p>
      <p className="mt-1 pl-6 text-sm font-bold text-steel">{t.notconfirmed_body.replace("{m}", myEngine)}</p>
      <a
        href={confirmLink}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-6 mt-2 inline-flex items-center gap-2 text-sm font-black text-navy underline"
      >
        <MessageCircle size={15} /> {t.confirm_fitment_wa}
      </a>
    </div>
  );
}
