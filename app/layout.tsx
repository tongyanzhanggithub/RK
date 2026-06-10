import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
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
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
