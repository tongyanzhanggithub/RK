import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { EngineProvider } from "@/components/engine-provider";
import { LanguageProvider } from "@/components/language-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export const metadata: Metadata = {
  title: {
    default: "Small Engine Repair Kits Store | RepairKit Supply",
    template: "%s | RepairKit Supply"
  },
  description: "Repair kits for small gasoline engines, portable generators, water pumps, tillers and sprayers. Find kits by equipment, model or problem."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <EngineProvider>
            <CartProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
              <WhatsAppFloat />
            </CartProvider>
          </EngineProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
