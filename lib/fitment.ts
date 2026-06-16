import { models, type EngineModel } from "@/data/models";
import type { Product } from "@/data/products";

// Tolerant token match so "GX160", "gx-160", "GX160 style engine" all map to
// the canonical "GX160" — the eBay ACES idea of a controlled vocabulary.
function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Find the canonical engine a free-text model string refers to, if any. */
export function matchCanonical(freeText: string, canonical: EngineModel[] = models): EngineModel | null {
  const needle = normalize(freeText);
  if (!needle) return null;
  // Prefer the longest canonical name that is contained in (or contains) the text.
  let best: EngineModel | null = null;
  for (const engine of canonical) {
    const name = normalize(engine.name);
    if (needle.includes(name) || name.includes(needle)) {
      if (!best || normalize(best.name).length < name.length) best = engine;
    }
  }
  return best;
}

export type FitmentStatus = "universal" | "ok" | "warn" | "gap";

export type ProductFitment = {
  product: Product;
  status: FitmentStatus;
  matched: string[]; // canonical engine names this product maps to
  unmatched: string[]; // free-text models that match no canonical engine
};

export function analyzeProductFitment(product: Product, canonical: EngineModel[] = models): ProductFitment {
  if (product.fitmentType === "UNIVERSAL") {
    return { product, status: "universal", matched: [], unmatched: [] };
  }

  const matched = new Set<string>();
  const unmatched: string[] = [];
  for (const raw of product.compatibleModels) {
    const hit = matchCanonical(raw, canonical);
    if (hit) matched.add(hit.name);
    else unmatched.push(raw);
  }

  let status: FitmentStatus;
  if (product.compatibleModels.length === 0) status = "gap";
  else if (unmatched.length > 0) status = "warn";
  else status = "ok";

  return { product, status, matched: [...matched], unmatched };
}

export type EngineCoverage = {
  engine: EngineModel;
  specificCount: number; // model-specific parts mapped to this engine
};

/** How many specific parts map to each canonical engine — exposes thin coverage. */
export function engineCoverage(products: Product[], canonical: EngineModel[] = models): EngineCoverage[] {
  const counts = new Map<string, number>();
  for (const engine of canonical) counts.set(engine.slug, 0);

  for (const product of products) {
    if (product.fitmentType === "UNIVERSAL") continue;
    const seen = new Set<string>();
    for (const raw of product.compatibleModels) {
      const hit = matchCanonical(raw, canonical);
      if (hit && !seen.has(hit.slug)) {
        seen.add(hit.slug);
        counts.set(hit.slug, (counts.get(hit.slug) || 0) + 1);
      }
    }
  }

  return canonical.map((engine) => ({ engine, specificCount: counts.get(engine.slug) || 0 }));
}

export type FitmentSummary = {
  total: number;
  withFitment: number; // universal OR has at least one matched canonical
  gaps: number; // specific parts with no compatible models at all
  warnings: number; // specific parts with unmatched free-text models
  universal: number;
  coveragePct: number;
};

export function fitmentSummary(analyses: ProductFitment[]): FitmentSummary {
  const total = analyses.length;
  const gaps = analyses.filter((a) => a.status === "gap").length;
  const warnings = analyses.filter((a) => a.status === "warn").length;
  const universal = analyses.filter((a) => a.status === "universal").length;
  const withFitment = analyses.filter((a) => a.status === "ok" || a.status === "universal").length;
  return {
    total,
    withFitment,
    gaps,
    warnings,
    universal,
    coveragePct: total > 0 ? Math.round((withFitment / total) * 100) : 0
  };
}
