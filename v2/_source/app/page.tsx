import Link from "next/link";
import { ProductCard } from "./components/ProductCard";
import { ModuleGrid } from "./components/PageElements";
import { fortuneModules, products, ritualModules } from "@/lib/data";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="home-hero-copy">
          <div className="eyebrow">MEEMON UNIVERSE · EST. 2024</div>
          <h1>
            ทุกความเชื่อ
            <br />
            มีพื้นที่ให้<span>เปล่งประกาย</span>
          </h1>
          <p>
            บ้านหลังใหม่ของ Meemon ที่รวมสิ่งมงคล งานออกแบบ คำทำนาย
            และพิธีประจำวันไว้ให้ค้นพบได้ง่ายขึ้น
          </p>
          <div className="hero-actions">
            <Link href="/v2/shop" className="button button-gold">
              สำรวจร้านค้า
            </Link>
            <Link href="/v2/fortune" className="button button-ghost">
              เปิดคำทำนายวันนี้
            </Link>
          </div>
          <div className="hero-stats">
            <div><strong>45</strong><span>สินค้าจริง</span></div>
            <div><strong>78</strong><span>ไพ่ทาโรต์</span></div>
            <div><strong>24</strong><span>ใบเซียมซี</span></div>
          </div>
        </div>
        <div className="hero-emblem" aria-hidden="true">
          <div className="emblem-stars">✦　·　✦</div>
          <img src="/v2/assets/brand/logo.png" alt="" />
          <span>DESTINY · FAITH · LIVING</span>
        </div>
      </section>

      <section className="home-section ritual-strip">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DAILY MOMENTS</div>
            <h2>วันนี้ ให้ Meemon ช่วยเรื่องอะไร</h2>
          </div>
          <Link href="/v2/fortune">ดูเครื่องมือทั้งหมด →</Link>
        </div>
        <div className="quick-grid">
          {[fortuneModules[0], fortuneModules[4], ritualModules[0], ritualModules[1]].map(
            (item) => (
              <Link href={item.href} key={item.href} className="quick-card">
                <span>{item.icon}</span>
                <div><small>{item.eyebrow}</small><strong>{item.title}</strong></div>
                <b>↗</b>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">MEEMON SELECTION</div>
            <h2>สิ่งมงคลที่คัดสรรมาเพื่อคุณ</h2>
          </div>
          <Link href="/v2/shop">ชมสินค้าทั้งหมด →</Link>
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
        </div>
        <ModuleGrid modules={fortuneModules.slice(0, 3)} />
      </section>

      <section className="home-section home-banner">
        <div>
          <div className="eyebrow">WALLPAPER COLLECTION</div>
          <h2>พกพลังดี ๆ ไปกับคุณทุกวัน</h2>
          <p>รวมวอลเปเปอร์มงคลตามวันเกิดและความปรารถนาในคลังเดียว</p>
          <Link href="/v2/wallpapers" className="button button-gold">
            เลือกวอลเปเปอร์
          </Link>
        </div>
        <div className="banner-symbol">☾</div>
      </section>
    </>
  );
}
