"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { BrandMark, Icon, type IconName } from "./Icons";

const navItems: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/v2", label: "หน้าแรก", icon: "home" },
  { href: "/v2/shop", label: "ร้านค้า", icon: "shop" },
  { href: "/v2/fortune", label: "ดูดวง", icon: "fortune" },
  { href: "/v2/rituals", label: "พิธีมงคล", icon: "ritual" },
  { href: "/v2/wallpapers", label: "วอลเปเปอร์", icon: "wallpaper" },
  { href: "/v2/contact", label: "ติดต่อ", icon: "contact" },
];

const mobileNavItems = navItems.slice(0, 4);

function isActive(pathname: string, href: string) {
  if (href === "/v2") {
    return pathname === "/" || pathname === "/v2" || pathname === "/v2/";
  }
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
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "active" : ""}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/v2/cart"
          className={`cart-button ${isActive(pathname, "/v2/cart") ? "active" : ""}`}
          aria-label={`เปิดตะกร้า มี ${itemCount} ชิ้น`}
        >
          <Icon name="cart" />
          <span>ตะกร้า</span>
          {itemCount > 0 ? <b>{itemCount}</b> : null}
        </Link>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <div className="footer-brand">MEEMON</div>
          <p>โลกของความเชื่อ งานออกแบบ และสิ่งมงคลในที่เดียว</p>
        </div>
        <div className="footer-links">
          <Link href="/v2/contact"><Icon name="contact" />ติดต่อ Meemon</Link>
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
          <Link
            key={item.href}
            href={item.href}
            className={isActive(pathname, item.href) ? "active" : ""}
          >
            <span><Icon name={item.icon} /></span>
            {item.label}
          </Link>
        ))}
        <Link
          href="/v2/cart"
          className={isActive(pathname, "/v2/cart") ? "active" : ""}
        >
          <span className="nav-cart-icon">
            <Icon name="cart" />
            {itemCount > 0 ? <b>{itemCount}</b> : null}
          </span>
          ตะกร้า
        </Link>
      </nav>
    </div>
  );
}
