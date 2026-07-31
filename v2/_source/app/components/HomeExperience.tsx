import Link from "next/link";
import {
  legacyHomeModules,
  legacyQuickModules,
  products,
} from "@/lib/data";
import { ProductCard } from "./ProductCard";
import { ModuleGrid } from "./PageElements";
import { BrandMark, Icon, type IconName } from "./Icons";
import { AppFolder } from "./AppFolder";

const launcherApps = [
  {
    href: "/v2/apps/home/",
    label: "ร้านค้า",
    eyebrow: "SHOP",
    image: "/v2/assets/app-icons/shop.png",
  },
  {
    href: "/v2/apps/NFCV.2/home/token.html",
    label: "ดูดวง",
    eyebrow: "FORTUNE",
    image: "/v2/assets/app-icons/fortune.png",
  },
  {
    href: "/v2/apps/card/Wallpaper/",
    label: "วอลเปเปอร์",
    eyebrow: "WALLPAPER",
    image: "/v2/assets/app-icons/wallpaper.png",
  },
  {
    href: "/v2/apps/How%20to/",
    label: "พิธีและคู่มือ",
    eyebrow: "RITUALS",
    image: "/v2/assets/app-icons/rituals.png",
  },
  {
    href: "/v2/apps/NFCV.2/Seimsee/token.html",
    label: "เซียมซี",
    eyebrow: "SEIMSEE",
    image: "/v2/assets/app-icons/seimsee.png",
  },
];

type AllApp = {
  href: string;
  label: string;
  description: string;
  icon: IconName;
};

const allAppGroups: Array<{
  eyebrow: string;
  title: string;
  apps: AllApp[];
}> = [
  {
    eyebrow: "FORTUNE & DIVINATION",
    title: "ดูดวงและเสี่ยงทาย",
    apps: [
      {
        href: "/v2/apps/NFCV.2/home/token.html",
        label: "ศูนย์รวมดูดวง",
        description: "ทางเข้าหลักของแอปดูดวง",
        icon: "fortune",
      },
      {
        href: "/v2/apps/NFCV.2/taro/1/token.html",
        label: "ไพ่ทาโรต์ 1 ใบ",
        description: "คำตอบสั้นสำหรับวันนี้",
        icon: "tarot",
      },
      {
        href: "/v2/apps/NFCV.2/taro/3/token.html",
        label: "ไพ่ทาโรต์ 3 ใบ",
        description: "อดีต ปัจจุบัน และอนาคต",
        icon: "tarot",
      },
      {
        href: "/v2/apps/NFCV.2/taro/10/token.html",
        label: "ไพ่ทาโรต์ 10 ใบ",
        description: "อ่านภาพรวมอย่างละเอียด",
        icon: "tarot",
      },
      {
        href: "/v2/apps/NFCV.2/Seimsee/token.html",
        label: "เสี่ยงเซียมซี",
        description: "เซียมซีออนไลน์ 24 ใบ",
        icon: "seimsee",
      },
      {
        href: "/v2/apps/NFCV.2/Wood/token.html",
        label: "ไม้เซ้งปวย",
        description: "โยนไม้ถามสิ่งศักดิ์สิทธิ์",
        icon: "jiaobei",
      },
      {
        href: "/v2/apps/NFCV.2/number/token.html",
        label: "เลขมงคล",
        description: "สุ่มตัวเลขประจำจังหวะ",
        icon: "lucky-number",
      },
      {
        href: "/v2/apps/NFCV.2/Lucky%20day/",
        label: "ดวงประจำวัน",
        description: "พลังวันเกิดและจังหวะจันทรา",
        icon: "daily",
      },
      {
        href: "/v2/apps/Color2026/Index.html",
        label: "สีมงคล 2026",
        description: "สีเสริมพลังตามวันเกิด",
        icon: "colors",
      },
    ],
  },
  {
    eyebrow: "RITUALS & LIFESTYLE",
    title: "พิธี คู่มือ และไลฟ์สไตล์",
    apps: [
      {
        href: "/v2/apps/home/",
        label: "ร้านค้า Meemon",
        description: "สินค้าและสิ่งมงคล",
        icon: "shop",
      },
      {
        href: "/v2/apps/app/test1.html",
        label: "จุดธูปขอเลข",
        description: "เปิดแอปจุดธูปเดิม",
        icon: "incense",
      },
      {
        href: "/v2/apps/openday/",
        label: "ฤกษ์เปิดกระเป๋า",
        description: "ตรวจวันเริ่มใช้กระเป๋า",
        icon: "wallet-opening",
      },
      {
        href: "/v2/apps/How%20to/",
        label: "คู่มือและคาถา",
        description: "วิธีเปิดกระเป๋าและคาถาเรียกเงิน",
        icon: "wallet-guide",
      },
      {
        href: "/v2/apps/pony/",
        label: "คาถาอัศวินพาหนะ",
        description: "ม้ามงคลและบทสวด",
        icon: "horse",
      },
      {
        href: "/v2/apps/card/Wallpaper/",
        label: "วอลเปเปอร์มงคล",
        description: "คลังภาพตามวันเกิด",
        icon: "wallpaper",
      },
    ],
  },
  {
    eyebrow: "CONTACT & ARCHIVE",
    title: "ติดต่อและคลังแอป",
    apps: [
      {
        href: "/v2/apps/Contact/",
        label: "ติดต่อ Meemon",
        description: "LINE, Facebook, TikTok และโทรศัพท์",
        icon: "contact",
      },
      {
        href: "/legacy",
        label: "คลังแอปเวอร์ชันเดิม",
        description: "ดูสารบัญ URL เก่าทั้งหมด",
        icon: "book",
      },
    ],
  },
];

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
      <section className="app-launcher" aria-labelledby="app-launcher-title">
        <div className="app-launcher-heading">
          <div>
            <div className="eyebrow">MEEMON UNIVERSE</div>
            <h2 id="app-launcher-title">เลือกประตูที่อยากเปิด</h2>
          </div>
          <p>ทุกแอปสำคัญ อยู่ใกล้แค่หนึ่งสัมผัส</p>
        </div>
        <div className="app-launcher-grid">
          {launcherApps.map((app) => (
            <a
              href={app.href}
              className="app-launcher-card"
              key={app.label}
            >
              <span className="app-launcher-art">
                <img src={app.image} alt="" width="640" height="640" />
              </span>
              <span className="app-launcher-copy">
                <small>{app.eyebrow}</small>
                <strong>{app.label}</strong>
              </span>
            </a>
          ))}
          <AppFolder groups={allAppGroups} />
        </div>
      </section>

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

      <section className="home-section ritual-strip" id="daily-tools">
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
