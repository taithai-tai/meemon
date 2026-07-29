import Link from "next/link";
import { fortuneModules, products, ritualModules } from "@/lib/data";
import { ProductCard } from "./ProductCard";
import { ModuleGrid } from "./PageElements";
import { BrandMark, Icon } from "./Icons";

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="section-link">
      {children}
      <Icon name="arrow-right" />
    </Link>
  );
}

export function HomeExperience() {
  const quickActions = [
    fortuneModules[0],
    fortuneModules[4],
    ritualModules[0],
    ritualModules[1],
  ];

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
            <Link href="/v2/shop" className="button button-gold">
              <Icon name="shop" />
              สำรวจร้านค้า
              <Icon name="arrow-right" />
            </Link>
            <Link href="/v2/fortune" className="button button-ghost">
              <Icon name="fortune" />
              เปิดคำทำนายวันนี้
            </Link>
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
          <SectionLink href="/v2/fortune">ดูเครื่องมือทั้งหมด</SectionLink>
        </div>
        <div className="quick-grid">
          {quickActions.map((item) => (
            <Link href={item.href} key={item.href} className="quick-card">
              <span className="quick-icon"><Icon name={item.icon} /></span>
              <div><small>{item.eyebrow}</small><strong>{item.title}</strong></div>
              <span className="card-arrow"><Icon name="arrow-up-right" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">MEEMON SELECTION</div>
            <h2>สิ่งมงคลที่คัดสรรมาเพื่อคุณ</h2>
          </div>
          <SectionLink href="/v2/shop">ชมสินค้าทั้งหมด</SectionLink>
        </div>
        <div className="product-grid featured-products">
          {products.slice(0, 4).map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">EXPLORE YOUR PATH</div>
            <h2>ศาสตร์ความเชื่อ ในภาษาของวันนี้</h2>
          </div>
          <SectionLink href="/v2/fortune">เลือกศาสตร์ของคุณ</SectionLink>
        </div>
        <ModuleGrid modules={fortuneModules.slice(0, 3)} />
      </section>

      <section className="home-section home-banner">
        <div>
          <div className="eyebrow">WALLPAPER COLLECTION</div>
          <h2>พกพลังดี ๆ ไปกับคุณทุกวัน</h2>
          <p>รวมวอลเปเปอร์มงคลตามวันเกิดและความปรารถนาในคลังเดียว</p>
          <Link href="/v2/wallpapers" className="button button-gold">
            <Icon name="wallpaper" />
            เลือกวอลเปเปอร์
            <Icon name="arrow-right" />
          </Link>
        </div>
        <div className="banner-symbol" aria-hidden="true">
          <Icon name="wallpaper" />
        </div>
      </section>
    </>
  );
}
