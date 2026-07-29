import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "./components/AppShell";
import { CartProvider } from "./components/CartProvider";
import { PwaRegister } from "./components/PwaRegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://meemon.net"),
  title: {
    default: "Meemon — Destiny · Faith · Living",
    template: "%s | Meemon",
  },
  description:
    "รวมร้านค้า เครื่องมือดูดวง พิธีมงคล และวอลเปเปอร์ของ Meemon ไว้ในที่เดียว",
  icons: {
    icon: "/v2/assets/brand/icon-192.png",
    apple: "/v2/assets/brand/icon-192.png",
  },
  manifest: "/v2/manifest.webmanifest",
  openGraph: {
    title: "Meemon — Destiny · Faith · Living",
    description: "โลกของความเชื่อ งานออกแบบ และสิ่งมงคลในที่เดียว",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <CartProvider>
          <PwaRegister />
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
