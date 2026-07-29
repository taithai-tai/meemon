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
  { href: "/home/", label: "ร้านค้า", icon: "shop", legacy: true },
  { href: "/NFCV.2/home/", label: "ดูดวง", icon: "fortune", legacy: true },
  { href: "/card/Wallpaper/", label: "วอลเปเปอร์", icon: "wallpaper", legacy: true },
  { href: "/How%20to/", label: "คู่มือ", icon: "book", legacy: true },
  { href: "/Contact/", label: "ติดต่อ", icon: "contact", legacy: true },
];

const mobileNavItems = [navItems[0], navItems[1], navItems[2], navItems[3], navItems[5]];

const legacyRedirects: Array<{
  prefix: string;
  href: string;
  label: string;
}> = [
  { prefix: "/v2/fortune/colors-2026", href: "/Color2026/Index.html", label: "สีมงคลเวอร์ชันเดิม" },
  { prefix: "/v2/fortune/lucky-number", href: "/NFCV.2/number/", label: "เลขมงคลเวอร์ชันเดิม" },
  { prefix: "/v2/fortune/seimsee", href: "/NFCV.2/Seimsee/", label: "เซียมซีเวอร์ชันเดิม" },
  { prefix: "/v2/fortune/jiaobei", href: "/NFCV.2/Wood/", label: "เซ้งปวยเวอร์ชันเดิม" },
  { prefix: "/v2/fortune/daily", href: "/NFCV.2/Lucky%20day/", label: "ดวงประจำวันเวอร์ชันเดิม" },
  { prefix: "/v2/fortune/tarot", href: "/NFCV.2/home/", label: "ไพ่ทาโรต์เวอร์ชันเดิม" },
  { prefix: "/v2/fortune/oracle", href: "/NFCV.2/home/", label: "ศูนย์รวมดูดวงเวอร์ชันเดิม" },
  { prefix: "/v2/fortune", href: "/NFCV.2/home/", label: "ศูนย์รวมดูดวงเวอร์ชันเดิม" },
  { prefix: "/v2/rituals/incense", href: "/app/test1.html", label: "จุดธูปเวอร์ชันเดิม" },
  { prefix: "/v2/rituals/wallet-opening", href: "/openday/", label: "ฤกษ์เปิดกระเป๋าเวอร์ชันเดิม" },
  { prefix: "/v2/rituals/wallet-guide", href: "/How%20to/", label: "คู่มือเปิดกระเป๋าเวอร์ชันเดิม" },
  { prefix: "/v2/rituals/horse-chant", href: "/pony/", label: "คาถาอัศวินพาหนะเวอร์ชันเดิม" },
  { prefix: "/v2/rituals/money-chant", href: "/How%20to/", label: "คาถาเรียกเงินเวอร์ชันเดิม" },
  { prefix: "/v2/rituals", href: "/How%20to/", label: "คู่มือและพิธีเวอร์ชันเดิม" },
  { prefix: "/v2/wallpapers", href: "/card/Wallpaper/", label: "วอลเปเปอร์เวอร์ชันเดิม" },
  { prefix: "/v2/contact", href: "/Contact/", label: "หน้าติดต่อเวอร์ชันเดิม" },
  { prefix: "/v2/checkout", href: "/home/", label: "ร้านค้าเวอร์ชันเดิม" },
  { prefix: "/v2/cart", href: "/home/", label: "ร้านค้าเวอร์ชันเดิม" },
  { prefix: "/v2/shop", href: "/home/", label: "ร้านค้าเวอร์ชันเดิม" },
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
      <div className="eyebrow">MEEMON ORIGINAL APP</div>
      <h1>กำลังเปิด{label}</h1>
      <p>ช่วงนี้ Meemon V2 เปิดใช้เฉพาะหน้า Home ส่วนฟังก์ชันนี้ยังใช้ระบบเดิม</p>
      <a href={href} className="button button-gold">
        เปิดแอปเดิม
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

        <a href="/home/" className="cart-button" aria-label="เปิดร้านค้าเวอร์ชันเดิม">
          <Icon name="shop" />
          <span>เปิดร้านค้า</span>
          <Icon name="arrow-up-right" />
        </a>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <div className="footer-brand">MEEMON</div>
          <p>หน้า Home ใหม่ที่เชื่อมทุกคนไปยังแอป Meemon เวอร์ชันเดิม</p>
        </div>
        <div className="footer-links">
          <a href="/Contact/"><Icon name="contact" />ติดต่อ Meemon</a>
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
