"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

const navItems = [
  { href: "/", label: "หน้าแรก", icon: "✦" },
  { href: "/v2/shop", label: "ร้านค้า", icon: "◇" },
  { href: "/v2/fortune", label: "ดูดวง", icon: "☾" },
  { href: "/v2/rituals", label: "พิธี", icon: "♨" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const isLegacyContent =
    !pathname.startsWith("/v2") && pathname !== "/" && pathname !== "/legacy";

  if (isLegacyContent) return <>{children}</>;

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Meemon Home">
          <span className="brand-mark">
            <img src="/v2/assets/brand/logo.png" alt="" />
          </span>
          <span>
            <strong>MEEMON</strong>
            <small>Destiny · Faith · Living</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="เมนูหลัก">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/v2/wallpapers">วอลเปเปอร์</Link>
          <Link href="/v2/contact">ติดต่อ</Link>
        </nav>
        <Link href="/v2/cart" className="cart-button" aria-label="เปิดตะกร้า">
          <span>ตะกร้า</span>
          <b>{itemCount}</b>
        </Link>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <div className="footer-brand">MEEMON</div>
          <p>โลกของความเชื่อ งานออกแบบ และสิ่งมงคลในที่เดียว</p>
        </div>
        <div className="footer-links">
          <Link href="/v2/contact">ติดต่อ Meemon</Link>
          <Link href="/legacy">คลังแอปเวอร์ชันเดิม</Link>
          <a href="https://shopee.co.th/king_6914" target="_blank" rel="noreferrer">
            Shopee Store
          </a>
        </div>
        <p className="belief-note">
          เนื้อหาคำทำนายและพิธีทั้งหมดเป็นความเชื่อส่วนบุคคล
        </p>
      </footer>

      <nav className="mobile-nav" aria-label="เมนูมือถือ">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(pathname, item.href) ? "active" : ""}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <Link
          href="/v2/cart"
          className={isActive(pathname, "/v2/cart") ? "active" : ""}
        >
          <span className="nav-cart-icon">
            ▱<b>{itemCount}</b>
          </span>
          ตะกร้า
        </Link>
      </nav>
    </div>
  );
}
