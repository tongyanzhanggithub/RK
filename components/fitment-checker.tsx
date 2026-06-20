"use client";

import Link from "next/link";
import { CheckCircle2, CircleAlert, CircleX, Globe, MessageCircle, ShieldCheck } from "lucide-react";
import { engineMatchesModels, useMyEngine } from "@/components/engine-provider";
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

  const confirmLink = whatsappLink(
    [
      "Hello, please confirm fitment for me:",
      `Product: ${productName}`,
      sku ? `SKU: ${sku}` : "",
      myEngine ? `My engine/machine: ${myEngine}` : "My engine/machine: (I will send a photo)",
      `Link: ${productUrl}`
    ]
      .filter(Boolean)
      .join("\n")
  );

  if (fitmentType === "UNIVERSAL") {
    return (
      <div className="border border-navy/30 bg-navy/5 p-4">
        <p className="inline-flex items-start gap-2 font-black text-navy">
          <Globe size={18} className="mt-0.5 shrink-0" /> Universal part — fits nearly all small engines
        </p>
        {fitmentNote && <p className="mt-1 pl-6 text-sm font-bold text-steel">{fitmentNote}</p>}
      </div>
    );
  }

  if (!myEngine) {
    return (
      <div className="border border-line bg-panel p-4">
        <p className="font-black">Will this fit your machine?</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) setMyEngine(event.target.value);
            }}
            aria-label="Select your engine model"
            className="h-11 border border-line bg-white px-3 text-sm font-bold outline-none focus:border-navy"
          >
            <option value="" disabled>
              Select your engine / machine...
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
            <MessageCircle size={16} /> Not sure? Ask us
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
          <CircleX size={18} className="mt-0.5 shrink-0" /> Not compatible with your {myEngine}
        </p>
        <p className="mt-1 pl-6 text-sm font-bold text-red-800/80">
          This kit is listed as not compatible with {myEngine}. Message us and we will find the right kit.
        </p>
        <a
          href={confirmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-6 mt-2 inline-flex items-center gap-2 text-sm font-black text-navy underline"
        >
          <MessageCircle size={15} /> Find the right kit on WhatsApp
        </a>
      </div>
    );
  }

  if (fits && guaranteed) {
    return (
      <div className="border border-green-600 bg-green-50 p-4">
        <p className="inline-flex items-start gap-2 text-lg font-black text-green-800">
          <ShieldCheck size={22} className="mt-0.5 shrink-0" /> Guaranteed Fit for your {myEngine}
        </p>
        <p className="mt-1 pl-7 text-sm font-bold text-green-800/90">
          {myEngine} is a verified match. If it doesn’t fit, return it free within 30 days.{" "}
          <Link href="/guaranteed-fit" className="text-navy underline">
            How Guaranteed Fit works
          </Link>
        </p>
        <a href={confirmLink} target="_blank" rel="noopener noreferrer" className="ml-7 mt-2 inline-flex items-center gap-2 text-sm font-black text-navy underline">
          <MessageCircle size={15} /> Still unsure? Confirm on WhatsApp
        </a>
      </div>
    );
  }

  if (fits) {
    return (
      <div className="border border-green-200 bg-green-50 p-4">
        <p className="inline-flex items-start gap-2 font-black text-green-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> Fits your {myEngine}
        </p>
        <p className="mt-1 pl-6 text-sm font-bold text-green-800/80">
          {myEngine} is listed as compatible. Still unsure about a detail (carburetor shape, mounting holes)?{" "}
          <a href={confirmLink} target="_blank" rel="noopener noreferrer" className="text-navy underline">
            Confirm on WhatsApp
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="border border-brand/60 bg-brand/10 p-4">
      <p className="inline-flex items-start gap-2 font-black text-ink">
        <CircleAlert size={18} className="mt-0.5 shrink-0" /> Not confirmed for your {myEngine}
      </p>
      <p className="mt-1 pl-6 text-sm font-bold text-steel">
        {myEngine} is not in the verified list for this kit. Send us a photo before ordering — fitment checks are free.
      </p>
      <a
        href={confirmLink}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-6 mt-2 inline-flex items-center gap-2 text-sm font-black text-navy underline"
      >
        <MessageCircle size={15} /> Confirm fitment on WhatsApp
      </a>
    </div>
  );
}
