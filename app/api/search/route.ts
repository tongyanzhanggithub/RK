import { NextResponse, type NextRequest } from "next/server";
import { models } from "@/data/models";
import { problems } from "@/data/problems";
import { formatMoney } from "@/lib/format";
import { getStoreProducts } from "@/lib/product-store";

export const runtime = "nodejs";

type SearchSuggestion = {
  type: "engine" | "problem" | "product";
  label: string;
  hint?: string;
  href: string;
};

/** Normalize for tolerant matching: "GX-160", "gx 160" and "GX160" all become "gx160". */
function normalize(value: string) {
  return value.toLowerCase().replace(/[\s\-_./]+/g, "");
}

function matches(haystack: string, needle: string) {
  return normalize(haystack).includes(needle);
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim();
  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }
  const needle = normalize(query);

  const engineSuggestions: SearchSuggestion[] = models
    .filter((model) => matches(model.name, needle) || matches(model.slug, needle))
    .slice(0, 3)
    .map((model) => ({
      type: "engine",
      label: `${model.name} parts`,
      hint: model.commonEquipment.slice(0, 2).join(", "),
      href: `/engines/${model.slug}`
    }));

  const problemSuggestions: SearchSuggestion[] = problems
    .filter(
      (problem) =>
        matches(problem.title, needle) ||
        problem.commonCauses.some((cause) => matches(cause, needle))
    )
    .slice(0, 3)
    .map((problem) => ({
      type: "problem",
      label: problem.title,
      hint: "Diagnosis & recommended kits",
      href: `/problems/${problem.slug}`
    }));

  const products = await getStoreProducts();
  const productSuggestions: SearchSuggestion[] = products
    .filter(
      (product) =>
        matches(product.name, needle) ||
        (product.sku ? matches(product.sku, needle) : false) ||
        matches(product.slug, needle) ||
        product.compatibleModels.some((model) => matches(model, needle)) ||
        product.problemsSolved.some((problem) => matches(problem, needle))
    )
    .slice(0, 5)
    .map((product) => ({
      type: "product",
      label: product.name,
      hint: formatMoney(product.priceCents, product.currency),
      href: `/products/${product.slug}`
    }));

  return NextResponse.json({
    suggestions: [...engineSuggestions, ...problemSuggestions, ...productSuggestions]
  });
}
