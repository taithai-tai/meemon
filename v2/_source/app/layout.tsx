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
    icon: "/v2/assets/brand/mark.svg",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Thai:wght@100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <PwaRegister />
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
