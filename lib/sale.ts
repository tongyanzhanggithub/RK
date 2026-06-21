// Single source of truth for flash-sale pricing. A product is "on sale" when it
// has a salePriceCents below its regular price AND the current time falls inside
// the optional [saleStartsAt, saleEndsAt] window (either bound may be omitted).
// Every place that reads a price — storefront cards, product page, and checkout —
// runs through saleState() so the discounted price is honored consistently.

export type SaleFields = {
  priceCents: number;
  compareAtPriceCents?: number | null;
  salePriceCents?: number | null;
  saleStartsAt?: Date | string | null;
  saleEndsAt?: Date | string | null;
};

export type SaleState = {
  onSale: boolean;
  /** The price to actually charge/display right now. */
  priceCents: number;
  /** Price to show struck-through (original or compare-at), or null. */
  originalCents: number | null;
  /** When the active sale ends, for the countdown. Null if no end bound. */
  endsAt: Date | null;
};

function toDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function saleState(product: SaleFields, now: Date = new Date()): SaleState {
  const sale = product.salePriceCents ?? null;
  const compareAt = product.compareAtPriceCents ?? null;
  const notOnSale: SaleState = {
    onSale: false,
    priceCents: product.priceCents,
    originalCents: compareAt && compareAt > product.priceCents ? compareAt : null,
    endsAt: null
  };

  if (sale == null || sale >= product.priceCents) return notOnSale;

  const start = toDate(product.saleStartsAt);
  const end = toDate(product.saleEndsAt);
  if (start && now < start) return notOnSale;
  if (end && now > end) return notOnSale;

  return { onSale: true, priceCents: sale, originalCents: product.priceCents, endsAt: end };
}

/** Convenience: the price to charge right now for a DB/normalized product. */
export function effectivePriceCents(product: SaleFields, now: Date = new Date()): number {
  return saleState(product, now).priceCents;
}
