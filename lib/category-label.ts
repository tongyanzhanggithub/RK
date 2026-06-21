import type { Locale } from "@/lib/i18n";

export type CategoryLite = {
  id?: string;
  slug: string;
  name: string;
  nameZh?: string | null;
  nameAr?: string | null;
  nameRu?: string | null;
  icon?: string | null;
  parentId?: string | null;
};

/** Localized display name for a category, falling back to the canonical English name. */
export function categoryLabel(cat: CategoryLite, locale: Locale): string {
  if (locale === "zh") return cat.nameZh || cat.name;
  if (locale === "ar") return cat.nameAr || cat.name;
  if (locale === "ru") return cat.nameRu || cat.name;
  return cat.name;
}
