import type { Locale } from "@/lib/i18n";

// Per-locale text overrides for a hero slide. Any omitted field falls back to the
// base (English) columns, so partial translations are fine.
export type HeroOverride = {
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  panelTitle?: string;
  bullets?: string[];
};

export type HeroTranslations = Partial<Record<Exclude<Locale, "en">, HeroOverride>>;

export function parseHeroTranslations(raw: string | null | undefined): HeroTranslations {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as HeroTranslations) : {};
  } catch {
    return {};
  }
}

type HeroTextFields = {
  badge: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string | null;
  panelTitle: string;
  bullets: string; // base column is a JSON string array
  translations: string | null;
};

/**
 * Resolve a hero slide's display text for the active locale. Non-English locales
 * overlay any provided overrides on top of the English base; missing fields fall
 * back to the base value so a half-translated slide never shows blanks.
 */
export function localizeHeroSlide(slide: HeroTextFields, locale: Locale) {
  const override = locale === "en" ? undefined : parseHeroTranslations(slide.translations)[locale];
  const pick = (key: keyof HeroOverride, base: string) => {
    const value = override?.[key];
    return typeof value === "string" && value.trim() ? value : base;
  };

  let baseBullets: string[] = [];
  try {
    baseBullets = JSON.parse(slide.bullets || "[]");
  } catch {
    baseBullets = [];
  }
  const bullets = override?.bullets && override.bullets.length ? override.bullets : baseBullets;

  return {
    badge: pick("badge", slide.badge),
    title: pick("title", slide.title),
    subtitle: pick("subtitle", slide.subtitle),
    primaryLabel: pick("primaryLabel", slide.primaryLabel),
    secondaryLabel:
      override?.secondaryLabel && override.secondaryLabel.trim() ? override.secondaryLabel : slide.secondaryLabel,
    panelTitle: pick("panelTitle", slide.panelTitle),
    bullets
  };
}
