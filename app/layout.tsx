import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { CartProvider } from "@/components/cart-provider";
import { EngineProvider } from "@/components/engine-provider";
import { LanguageProvider } from "@/components/language-provider";
import { QuoteProvider } from "@/components/quote-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";

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
  return (
    <html lang="en">
      <body>
        <Analytics />
        <LanguageProvider>
          <EngineProvider>
            <CartProvider>
              <QuoteProvider>
                <SiteHeader />
                {children}
                <SiteFooter />
                <WhatsAppFloat />
              </QuoteProvider>
            </CartProvider>
          </EngineProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
