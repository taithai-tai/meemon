import Link from "next/link";
import {
  legacyHomeModules,
  legacyQuickModules,
  products,
} from "@/lib/data";
import { ProductCard } from "./ProductCard";
import { ModuleGrid } from "./PageElements";
import { BrandMark, Icon } from "./Icons";

function SectionLink({
  href,
  children,
  legacy = false,
}: {
  href: string;
  children: React.ReactNode;
  legacy?: boolean;
}) {
  const content = <>{children}<Icon name="arrow-right" /></>;
  return legacy ? (
    <a href={href} className="section-link">{content}</a>
  ) : (
    <Link href={href} className="section-link">{content}</Link>
  );
}

export function HomeExperience() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="home-hero-copy">
          <div className="hero-kicker">
            <Icon name="sparkle" />
            MEEMON HOME · VERSION 2
          </div>
          <h1>
            ทุกความเชื่อ
            <br />
            มีพื้นที่ให้<span>เปล่งประกาย</span>
          </h1>
          <p>
            บ้านของ Meemon ที่รวมสิ่งมงคล งานออกแบบ คำทำนาย
            และพิธีประจำวันไว้ในประสบการณ์เดียวที่สงบและค้นพบได้ง่าย
          </p>
          <div className="hero-actions">
            <a href="/v2/apps/home/" className="button button-gold">
              <Icon name="shop" />
              สำรวจร้านค้า
              <Icon name="arrow-right" />
            </a>
            <a href="/v2/apps/NFCV.2/home/token.html" className="button button-ghost">
              <Icon name="fortune" />
              เปิดคำทำนายวันนี้
            </a>
          </div>
          <div className="hero-stats" aria-label="สิ่งที่มีใน Meemon">
            <div><strong>45</strong><span>สินค้าจริง</span></div>
            <div><strong>13</strong><span>เครื่องมือและพิธี</span></div>
            <div><strong>46</strong><span>วอลเปเปอร์มงคล</span></div>
          </div>
        </div>

        <div className="hero-emblem" aria-hidden="true">
          <div className="emblem-stars">
            <Icon name="sparkle" />
            <span>DISCOVER YOUR PATH</span>
          </div>
          <BrandMark />
          <div className="emblem-caption">DESTINY · FAITH · LIVING</div>
        </div>
      </section>

      <section className="home-section ritual-strip">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DAILY MOMENTS</div>
            <h2>วันนี้ ให้ Meemon ช่วยเรื่องอะไร</h2>
          </div>
          <SectionLink href="/v2/apps/NFCV.2/home/token.html" legacy>ดูเครื่องมือทั้งหมด</SectionLink>
        </div>
        <div className="quick-grid">
          {legacyQuickModules.map((item) => (
            <a href={item.href} key={item.href} className="quick-card">
              <span className="quick-icon"><Icon name={item.icon} /></span>
              <div><small>{item.eyebrow}</small><strong>{item.title}</strong></div>
              <span className="card-arrow"><Icon name="arrow-up-right" /></span>
            </a>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">MEEMON SELECTION</div>
            <h2>สิ่งมงคลที่คัดสรรมาเพื่อคุณ</h2>
          </div>
          <SectionLink href="/v2/apps/home/" legacy>เปิดร้านค้าฉบับที่คัดลอกมา</SectionLink>
        </div>
        <div className="product-grid featured-products">
          {products.slice(0, 4).map((product) => (
            <ProductCard product={product} legacyHref="/v2/apps/home/" key={product.id} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">EXPLORE YOUR PATH</div>
            <h2>ศาสตร์ความเชื่อ ในภาษาของวันนี้</h2>
          </div>
          <SectionLink href="/v2/apps/NFCV.2/home/token.html" legacy>เปิดศูนย์รวมดูดวงฉบับที่คัดลอกมา</SectionLink>
        </div>
        <ModuleGrid modules={legacyHomeModules} />
      </section>

      <section className="home-section home-banner">
        <div>
          <div className="eyebrow">WALLPAPER COLLECTION</div>
          <h2>พกพลังดี ๆ ไปกับคุณทุกวัน</h2>
          <p>รวมวอลเปเปอร์มงคลตามวันเกิดและความปรารถนาในคลังเดียว</p>
          <a href="/v2/apps/card/Wallpaper/" className="button button-gold">
            <Icon name="wallpaper" />
            เลือกวอลเปเปอร์
            <Icon name="arrow-right" />
          </a>
        </div>
        <div className="banner-symbol" aria-hidden="true">
          <Icon name="wallpaper" />
        </div>
      </section>
    </>
  );
}
