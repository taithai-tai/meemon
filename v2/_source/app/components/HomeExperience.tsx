import { products } from "@/lib/data";
import { ProductCard } from "./ProductCard";
import { Icon } from "./Icons";
import { AppFolder } from "./AppFolder";

const launcherApps = [
  {
    href: "/v2/shop",
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
  image: string;
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
        image: "/v2/assets/app-icons/fortune.png",
      },
      {
        href: "/v2/apps/NFCV.2/taro/1/token.html",
        label: "ไพ่ทาโรต์ 1 ใบ",
        description: "คำตอบสั้นสำหรับวันนี้",
        image: "/v2/assets/app-icons/tarot-one.png",
      },
      {
        href: "/v2/apps/NFCV.2/taro/3/token.html",
        label: "ไพ่ทาโรต์ 3 ใบ",
        description: "อดีต ปัจจุบัน และอนาคต",
        image: "/v2/assets/app-icons/tarot-three.png",
      },
      {
        href: "/v2/apps/NFCV.2/taro/10/token.html",
        label: "ไพ่ทาโรต์ 10 ใบ",
        description: "อ่านภาพรวมอย่างละเอียด",
        image: "/v2/assets/app-icons/tarot-ten.png",
      },
      {
        href: "/v2/apps/NFCV.2/Seimsee/token.html",
        label: "เสี่ยงเซียมซี",
        description: "เซียมซีออนไลน์ 24 ใบ",
        image: "/v2/assets/app-icons/seimsee.png",
      },
      {
        href: "/v2/apps/NFCV.2/Wood/token.html",
        label: "ไม้เซ้งปวย",
        description: "โยนไม้ถามสิ่งศักดิ์สิทธิ์",
        image: "/v2/assets/app-icons/jiaobei.png",
      },
      {
        href: "/v2/apps/NFCV.2/number/token.html",
        label: "เลขมงคล",
        description: "สุ่มตัวเลขประจำจังหวะ",
        image: "/v2/assets/app-icons/lucky-number.png",
      },
      {
        href: "/v2/apps/NFCV.2/Lucky%20day/",
        label: "ดวงประจำวัน",
        description: "พลังวันเกิดและจังหวะจันทรา",
        image: "/v2/assets/app-icons/daily.png",
      },
      {
        href: "/v2/apps/Color2026/Index.html",
        label: "สีมงคล 2026",
        description: "สีเสริมพลังตามวันเกิด",
        image: "/v2/assets/app-icons/colors-2026.png",
      },
    ],
  },
  {
    eyebrow: "RITUALS & LIFESTYLE",
    title: "พิธี คู่มือ และไลฟ์สไตล์",
    apps: [
      {
        href: "/v2/shop",
        label: "ร้านค้า Meemon",
        description: "สินค้าและสิ่งมงคล",
        image: "/v2/assets/app-icons/shop.png",
      },
      {
        href: "/v2/apps/app/test1.html",
        label: "จุดธูปขอเลข",
        description: "เปิดแอปจุดธูปเดิม",
        image: "/v2/assets/app-icons/incense.png",
      },
      {
        href: "/v2/apps/openday/",
        label: "ฤกษ์เปิดกระเป๋า",
        description: "ตรวจวันเริ่มใช้กระเป๋า",
        image: "/v2/assets/app-icons/wallet-opening.png",
      },
      {
        href: "/v2/apps/How%20to/",
        label: "คู่มือและคาถา",
        description: "วิธีเปิดกระเป๋าและคาถาเรียกเงิน",
        image: "/v2/assets/app-icons/wallet-guide.png",
      },
      {
        href: "/v2/apps/pony/",
        label: "คาถาอัศวินพาหนะ",
        description: "ม้ามงคลและบทสวด",
        image: "/v2/assets/app-icons/horse.png",
      },
      {
        href: "/v2/apps/card/Wallpaper/",
        label: "วอลเปเปอร์มงคล",
        description: "คลังภาพตามวันเกิด",
        image: "/v2/assets/app-icons/wallpaper.png",
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
        image: "/v2/assets/app-icons/contact.png",
      },
      {
        href: "/legacy",
        label: "คลังแอปเวอร์ชันเดิม",
        description: "ดูสารบัญ URL เก่าทั้งหมด",
        image: "/v2/assets/app-icons/archive.png",
      },
    ],
  },
];

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
        </div>
      </section>

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

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">MEEMON SELECTION</div>
            <h2>สิ่งมงคลที่คัดสรรมาเพื่อคุณ</h2>
          </div>
        </div>
        <div className="product-grid featured-products">
          {products.slice(0, 4).map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </section>

      <section className="home-section home-banner">
        <div>
          <div className="eyebrow">WALLPAPER COLLECTION</div>
          <h2>พกพลังดี ๆ ไปกับคุณทุกวัน</h2>
          <p>รวมวอลเปเปอร์มงคลตามวันเกิดและความปรารถนาในคลังเดียว</p>
        </div>
        <div className="banner-symbol" aria-hidden="true">
          <Icon name="wallpaper" />
        </div>
      </section>
    </>
  );
}
