"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BrandMark, Icon, type IconName } from "./Icons";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  legacy?: boolean;
};

const navItems: NavItem[] = [
  { href: "/v2/", label: "หน้าแรก", icon: "home" },
  { href: "/v2/apps/home/", label: "ร้านค้า", icon: "shop", legacy: true },
  { href: "/v2/apps/NFCV.2/home/token.html", label: "ดูดวง", icon: "fortune", legacy: true },
  { href: "/v2/apps/card/Wallpaper/", label: "วอลเปเปอร์", icon: "wallpaper", legacy: true },
  { href: "/v2/apps/How%20to/", label: "คู่มือ", icon: "book", legacy: true },
  { href: "/v2/apps/Contact/", label: "ติดต่อ", icon: "contact", legacy: true },
];

const mobileNavItems = [navItems[0], navItems[1], navItems[2], navItems[3], navItems[5]];

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

function NavLink({
  item,
  active = false,
}: {
  item: NavItem;
  active?: boolean;
}) {
  const content = (
    <>
      <span className="nav-item-icon">
        <Icon name={item.icon} />
      </span>
      {item.label}
    </>
  );

  return item.legacy ? (
    <a href={item.href} className={active ? "active" : ""}>
      {content}
    </a>
  ) : (
    <Link href={item.href} className={active ? "active" : ""}>
      {content}
    </Link>
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

        <nav className="desktop-nav" aria-label="เมนูหลัก">
          {navItems.map((item) => (
            <NavLink item={item} active={!item.legacy && isHome(pathname)} key={item.href} />
          ))}
        </nav>

        <a href="/v2/apps/home/" className="cart-button" aria-label="เปิดสำเนาร้านค้าใน V2">
          <Icon name="shop" />
          <span>เปิดร้านค้า</span>
          <Icon name="arrow-up-right" />
        </a>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <div className="footer-brand">MEEMON</div>
          <p>หน้า Home ใหม่และสำเนาแอป Meemon ที่จัดเก็บอยู่ภายใน V2</p>
        </div>
        <div className="footer-links">
          <a href="/v2/apps/Contact/"><Icon name="contact" />ติดต่อ Meemon</a>
          <Link href="/legacy"><Icon name="book" />คลังแอปเวอร์ชันเดิม</Link>
          <a href="https://shopee.co.th/king_6914" target="_blank" rel="noreferrer">
            <Icon name="store" />Shopee Store
          </a>
        </div>
        <p className="belief-note">
          เนื้อหาคำทำนายและพิธีทั้งหมดเป็นความเชื่อส่วนบุคคล
        </p>
      </footer>

      <nav className="mobile-nav" aria-label="เมนูมือถือ">
        {mobileNavItems.map((item) => (
          <NavLink item={item} active={!item.legacy && isHome(pathname)} key={item.href} />
        ))}
      </nav>
    </div>
  );
}
