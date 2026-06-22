import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CartProvider } from "@/components/cart-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { EngineProvider } from "@/components/engine-provider";
import { LanguageProvider } from "@/components/language-provider";
import { QuoteProvider } from "@/components/quote-provider";
import { RegionProvider } from "@/components/region-provider";
import { NewsletterPopup } from "@/components/newsletter-popup";
import { ToastProvider } from "@/components/toast-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { headers } from "next/headers";
import { RTL_LOCALES } from "@/lib/i18n";
import { getServerLocale } from "@/lib/locale";
import { getServerCountry } from "@/lib/region-server";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import type { CategoryLite } from "@/lib/category-label";

// Active categories for the storefront nav. Resilient: a DB hiccup must not 500
// the whole site, so we fall back to an empty menu.
async function getNavCategories(): Promise<CategoryLite[]> {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, nameZh: true, nameAr: true, nameRu: true, icon: true, parentId: true }
    });
  } catch {
    return [];
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";
const SITE_NAME = "Partavio";
const SITE_DESC =
  "Factory-direct auto parts, engine spares, repair kits and complete engines. Wholesale for the Middle East, Central Asia and Southeast Asia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Auto Parts & Complete Engines — Factory Direct | Partavio",
    template: "%s | Partavio"
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Wholesale Auto Parts & Complete Engines — Factory Direct",
    description: SITE_DESC,
    url: SITE_URL
  },
  twitter: {
    card: "summary_large_image",
    title: "Wholesale Auto Parts & Complete Engines — Factory Direct",
    description: SITE_DESC
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const country = getServerCountry();
  const locale = getServerLocale();
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  // The admin area has its own shell — render it without the storefront chrome.
  const isAdmin = (headers().get("x-pathname") || "").startsWith("/admin");
  const [categories, settings] = isAdmin
    ? [[], {} as Record<string, string>]
    : await Promise.all([getNavCategories(), getSettings().catch(() => ({}) as Record<string, string>)]);
  return (
    <html lang={locale} dir={dir}>
      <body>
        <Analytics />
        <ToastProvider>
        <LanguageProvider initialLocale={locale}>
          <RegionProvider initialCountryCode={country.code} chargeEnabled={process.env.STRIPE_MULTICURRENCY === "1"}>
            <EngineProvider>
              <CartProvider>
                <QuoteProvider>
                  {isAdmin ? (
                    children
                  ) : (
                    <>
                      {settings.announcement ? (
                        <AnnouncementBar text={settings.announcement} link={settings.announcement_link} />
                      ) : null}
                      <SiteHeader categories={categories} />
                      {children}
                      <SiteFooter />
                      <WhatsAppFloat />
                      <CookieConsent />
                      {settings.popup_enabled === "on" ? (
                        <NewsletterPopup
                          title={settings.popup_title || "Wholesale prices & restock alerts"}
                          body={settings.popup_body || "Leave your email for wholesale deals and new-arrival alerts."}
                          delaySeconds={Number(settings.popup_delay_seconds) || 8}
                        />
                      ) : null}
                    </>
                  )}
                </QuoteProvider>
              </CartProvider>
            </EngineProvider>
          </RegionProvider>
        </LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
