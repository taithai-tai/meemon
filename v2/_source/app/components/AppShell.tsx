"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type CSSProperties } from "react";
import { BrandMark, Icon } from "./Icons";

const cosmicStars = Array.from({ length: 72 }, (_, index) => ({
  left: `${(index * 47 + 11) % 101}%`,
  top: `${(index * 73 + 7) % 103}%`,
  size: 1 + ((index * 29) % 4) * 0.55,
  duration: 3.6 + ((index * 31) % 43) / 10,
  delay: ((index * 17) % 67) / 10,
  tone: index % 5 === 0 ? "violet" : index % 3 === 0 ? "gold" : "ivory",
}));

const legacyRedirects: Array<{
  prefix: string;
  href: string;
  label: string;
}> = [
  { prefix: "/v2/fortune/colors-2026", href: "/v2/apps/Color2026/Index.html", label: "สำเนาแอปสีมงคล" },
  { prefix: "/v2/fortune/lucky-number", href: "/v2/apps/NFCV.2/number/token.html", label: "สำเนาแอปเลขมงคล" },
  { prefix: "/v2/fortune/seimsee", href: "/v2/apps/NFCV.2/Seimsee/token.html", label: "สำเนาแอปเซียมซี" },
  { prefix: "/v2/fortune/jiaobei", href: "/v2/apps/NFCV.2/Wood/token.html", label: "สำเนาแอปเซ้งปวย" },
  { prefix: "/v2/fortune/daily", href: "/v2/apps/NFCV.2/Lucky%20day/", label: "สำเนาแอปดวงประจำวัน" },
  { prefix: "/v2/fortune/tarot", href: "/v2/apps/NFCV.2/home/token.html", label: "สำเนาแอปไพ่ทาโรต์" },
  { prefix: "/v2/fortune/oracle", href: "/v2/apps/NFCV.2/home/token.html", label: "สำเนาศูนย์รวมดูดวง" },
  { prefix: "/v2/fortune", href: "/v2/apps/NFCV.2/home/token.html", label: "สำเนาศูนย์รวมดูดวง" },
  { prefix: "/v2/rituals/incense", href: "/v2/apps/app/test1.html", label: "สำเนาแอปจุดธูป" },
  { prefix: "/v2/rituals/wallet-opening", href: "/v2/apps/openday/", label: "สำเนาแอปฤกษ์เปิดกระเป๋า" },
  { prefix: "/v2/rituals/wallet-guide", href: "/v2/apps/How%20to/", label: "สำเนาคู่มือเปิดกระเป๋า" },
  { prefix: "/v2/rituals/horse-chant", href: "/v2/apps/pony/", label: "สำเนาแอปคาถาอัศวินพาหนะ" },
  { prefix: "/v2/rituals/money-chant", href: "/v2/apps/How%20to/", label: "สำเนาคาถาเรียกเงิน" },
  { prefix: "/v2/rituals", href: "/v2/apps/How%20to/", label: "สำเนาคู่มือและพิธี" },
  { prefix: "/v2/wallpapers", href: "/v2/apps/card/Wallpaper/", label: "สำเนาแอปวอลเปเปอร์" },
  { prefix: "/v2/contact", href: "/v2/apps/Contact/", label: "สำเนาหน้าติดต่อ" },
  { prefix: "/v2/checkout", href: "/v2/apps/home/", label: "สำเนาร้านค้า" },
  { prefix: "/v2/cart", href: "/v2/apps/home/", label: "สำเนาร้านค้า" },
  { prefix: "/v2/shop", href: "/v2/apps/home/", label: "สำเนาร้านค้า" },
];

function isHome(pathname: string) {
  return pathname === "/" || pathname === "/v2" || pathname === "/v2/";
}

function legacyTargetFor(pathname: string) {
  if (isHome(pathname)) return null;
  return (
    legacyRedirects.find(
      (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`),
    ) ?? null
  );
}

function LegacyForward({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <main className="legacy-forward">
      <span className="brand-mark"><BrandMark /></span>
      <div className="eyebrow">MEEMON V2 · COPIED APP</div>
      <h1>กำลังเปิด{label}</h1>
      <p>กำลังเปิดสำเนาแอปเดิมที่เก็บอยู่ภายในโฟลเดอร์ V2</p>
      <a href={href} className="button button-gold">
        เปิดสำเนาแอป
        <Icon name="arrow-right" />
      </a>
    </main>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const legacyTarget = legacyTargetFor(pathname);
  const isLegacyContent =
    !pathname.startsWith("/v2") && pathname !== "/" && pathname !== "/legacy";

  if (legacyTarget) {
    return <LegacyForward href={legacyTarget.href} label={legacyTarget.label} />;
  }

  if (isLegacyContent) return <>{children}</>;

  return (
    <div className="site-shell">
      <div className="cosmic-sky" aria-hidden="true">
        <div className="cosmic-watermark">
          <span>DISCOVER YOUR PATH</span>
          <BrandMark />
          <small>DESTINY · FAITH · LIVING</small>
        </div>
        <div className="cosmic-starfield">
          {cosmicStars.map((star, index) => (
            <i
              className={`cosmic-star cosmic-star-${star.tone}`}
              key={index}
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDuration: `${star.duration}s`,
                animationDelay: `-${star.delay}s`,
              } as CSSProperties}
            />
          ))}
        </div>
      </div>
      <header className="site-header">
        <Link href="/v2/" className="brand" aria-label="Meemon Home">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span>
            <strong>MEEMON</strong>
            <small>DESTINY · FAITH · LIVING</small>
          </span>
        </Link>

      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <div className="footer-brand">MEEMON</div>
          <p>หน้า Home ใหม่และสำเนาแอป Meemon ที่จัดเก็บอยู่ภายใน V2</p>
        </div>
        <p className="belief-note">
          เนื้อหาคำทำนายและพิธีทั้งหมดเป็นความเชื่อส่วนบุคคล
        </p>
      </footer>
    </div>
  );
}
