import { NextResponse } from "next/server";
import { createAirwallexCheckout } from "@/lib/payments/airwallex";

export const runtime = "nodejs";

// Placeholder until the Airwallex merchant account + API keys exist.
// createAirwallexCheckout() currently throws a friendly "not configured" error.
export async function POST() {
  try {
    const { url } = await createAirwallexCheckout();
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Airwallex 暂不可用。";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
