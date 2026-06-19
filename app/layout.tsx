import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { CartProvider } from "@/components/cart-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { EngineProvider } from "@/components/engine-provider";
import { LanguageProvider } from "@/components/language-provider";
import { QuoteProvider } from "@/components/quote-provider";
import { RegionProvider } from "@/components/region-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getServerCountry } from "@/lib/region-server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";
const SITE_NAME = "RepairKit Supply";
const SITE_DESC =
  "Factory-direct small engine parts, repair kits and complete engines. Wholesale for the Middle East, Central Asia and Southeast Asia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Small Engine Repair Kits Store | RepairKit Supply",
    template: "%s | RepairKit Supply"
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Wholesale Small Engine Parts — Factory Direct",
    description: SITE_DESC,
    url: SITE_URL
  },
  twitter: {
    card: "summary_large_image",
    title: "Wholesale Small Engine Parts — Factory Direct",
    description: SITE_DESC
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const country = getServerCountry();
  return (
    <html lang="en">
      <body>
        <Analytics />
        <LanguageProvider>
          <RegionProvider initialCountryCode={country.code} chargeEnabled={process.env.STRIPE_MULTICURRENCY === "1"}>
            <EngineProvider>
              <CartProvider>
                <QuoteProvider>
                  <SiteHeader />
                  {children}
                  <SiteFooter />
                  <WhatsAppFloat />
                  <CookieConsent />
                </QuoteProvider>
              </CartProvider>
            </EngineProvider>
          </RegionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
