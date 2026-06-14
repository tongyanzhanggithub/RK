import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { LanguageProvider } from "@/components/language-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { LANG_COOKIE, normalizeLang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "Small Engine Repair Kits Store | RepairKit Supply",
    template: "%s | RepairKit Supply"
  },
  description: "Repair kits for small gasoline engines, portable generators, water pumps, tillers and sprayers. Find kits by equipment, model or problem."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = normalizeLang(cookies().get(LANG_COOKIE)?.value);
  return (
    <html lang={lang}>
      <body>
        <LanguageProvider initialLang={lang}>
          <CartProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <WhatsAppFloat />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
