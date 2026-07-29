import productsJson from "@/data/products.json";
import contentJson from "@/data/legacy-content.json";
import type { ContentModule, Product, ProductCategory, TarotCard } from "./types";

export const products = productsJson as Product[];

export const categories: Array<{
  id: "all" | ProductCategory;
  label: string;
}> = [
  { id: "all", label: "ทั้งหมด" },
  { id: "wallets", label: "กระเป๋า & เครื่องหนัง" },
  { id: "charms", label: "กำไล & เครื่องราง" },
  { id: "sacred", label: "วัตถุมงคล" },
  { id: "lifestyle", label: "ไลฟ์สไตล์" },
  { id: "other", label: "อื่น ๆ" },
];

export const content = contentJson as {
  oracleCards: Array<{
    name: string;
    icon: string;
    meaning: string;
    lucky: string;
  }>;
  tarotCards: TarotCard[];
  fortunes: Array<{
    number: number;
    level: string;
    title: string;
    main: string;
    advice: string;
  }>;
  colors: Record<
    string,
    {
      id: string;
      name: string;
      enName: string;
      deityName: string;
      worship: string;
      icon: string;
      luckyColors: Array<{
        color: string;
        label: string;
        desc: string;
        textColor: string;
      }>;
    }
  >;
  luckyDays: Array<{ id: number; name: string; color: string }>;
  thaksa: Record<
    string,
    { label: string; meaning: string; type: string }
  >;
  chants: Array<{
    id: string;
    title: string;
    subtitle: string;
    element: string;
    power: string[];
    suitableFor: string[];
    preparation: string[];
    chantText: string[];
    rounds: number;
    audioInstruction: string;
    themeColor: string;
    image: string;
  }>;
  wallpapers: {
    days: Array<{
      id: string;
      name: string;
      thai: string;
      emoji: string;
      files: Record<string, string>;
    }>;
    anyDay: Array<{
      name: string;
      icon: string;
      sub: string;
      url: string;
    }>;
  };
};

export const fortuneModules: ContentModule[] = [
  {
    href: "/v2/fortune/oracle",
    eyebrow: "คำแนะนำฉบับเร็ว",
    title: "ไพ่ออราเคิล",
    description: "เปิดไพ่หนึ่งใบ รับข้อความและเลขมงคลสำหรับวันนี้",
    icon: "oracle",
  },
  {
    href: "/v2/fortune/tarot",
    eyebrow: "78 ใบ",
    title: "ไพ่ทาโรต์",
    description: "เลือกสำรับ 1, 3 หรือ 10 ใบได้ในประสบการณ์เดียว",
    icon: "tarot",
  },
  {
    href: "/v2/fortune/seimsee",
    eyebrow: "24 คำทำนาย",
    title: "เซียมซี",
    description: "ตั้งจิตให้สงบแล้วเขย่ากระบอกเพื่อรับคำแนะนำ",
    icon: "seimsee",
  },
  {
    href: "/v2/fortune/jiaobei",
    eyebrow: "ถามสิ่งศักดิ์สิทธิ์",
    title: "เซ้งปวย",
    description: "โยนไม้เสี่ยงทายสองชิ้นและอ่านความหมายตามแบบเดิม",
    icon: "jiaobei",
  },
  {
    href: "/v2/fortune/lucky-number",
    eyebrow: "ตัวเลขประจำจังหวะ",
    title: "เลขมงคล 4 หลัก",
    description: "สุ่มตัวเลขพร้อมจังหวะเปิดทีละหลัก",
    icon: "lucky-number",
  },
  {
    href: "/v2/fortune/daily",
    eyebrow: "ทักษา & จันทรา",
    title: "ดวงประจำวัน",
    description: "ดูพลังของวันเกิดตามข้างขึ้นและข้างแรม",
    icon: "daily",
  },
  {
    href: "/v2/fortune/colors-2026",
    eyebrow: "ฉบับ 2026",
    title: "สีมงคลประจำวันเกิด",
    description: "เลือกวันเกิดเพื่อดูสีเสริมอำนาจ โชคลาภ และเมตตา",
    icon: "colors",
  },
];

export const ritualModules: ContentModule[] = [
  {
    href: "/v2/rituals/incense",
    eyebrow: "ใช้ฟรี",
    title: "จุดธูปขอเลขมงคล",
    description: "พิธีจุดธูปแบบใหม่ ไม่ใช้แต้มและไม่ต้องสมัครสมาชิก",
    icon: "incense",
  },
  {
    href: "/v2/rituals/wallet-opening",
    eyebrow: "จังหวะจันทรา",
    title: "ฤกษ์เปิดกระเป๋า",
    description: "ตรวจวันเหมาะสมสำหรับเริ่มใช้กระเป๋าใบใหม่",
    icon: "wallet-opening",
  },
  {
    href: "/v2/rituals/wallet-guide",
    eyebrow: "3 ขั้นตอน",
    title: "คู่มือเปิดกระเป๋า",
    description: "ขั้นตอนเดิมของ Meemon จัดให้อ่านและทำตามได้ง่ายขึ้น",
    icon: "wallet-guide",
  },
  {
    href: "/v2/rituals/horse-chant",
    eyebrow: "ม้า 3 ธาตุ",
    title: "คาถาอัศวินพาหนะ",
    description: "ม้าแดง ม้าเบจ และม้าขาว พร้อมตัวนับรอบการสวด",
    icon: "horse",
  },
  {
    href: "/v2/rituals/money-chant",
    eyebrow: "เสียงคาถาต้นฉบับ",
    title: "คาถาเรียกเงิน",
    description: "ฟังเสียงและทบทวนบทคาถาจากคู่มือ Meemon",
    icon: "money",
  },
  {
    href: "/v2/wallpapers",
    eyebrow: "46 แบบ",
    title: "วอลเปเปอร์มงคล",
    description: "เลือกตามวันเกิดหรือความปรารถนาแล้วดาวน์โหลดได้ทันที",
    icon: "wallpaper",
  },
];

export const legacyHomeModules: ContentModule[] = [
  {
    href: "/NFCV.2/home/",
    eyebrow: "แอปเวอร์ชันเดิม",
    title: "ไพ่ทาโรต์",
    description: "เลือกเปิดไพ่แบบ 1, 3 หรือ 10 ใบจากศูนย์รวมดูดวงเดิม",
    icon: "tarot",
    legacy: true,
  },
  {
    href: "/NFCV.2/Seimsee/",
    eyebrow: "24 คำทำนาย",
    title: "เซียมซี",
    description: "ตั้งจิตให้สงบแล้วเสี่ยงเซียมซีด้วยระบบเดิมของ Meemon",
    icon: "seimsee",
    legacy: true,
  },
  {
    href: "/NFCV.2/Wood/",
    eyebrow: "ถามสิ่งศักดิ์สิทธิ์",
    title: "เซ้งปวย",
    description: "โยนไม้เสี่ยงทายและอ่านคำตอบจากแอปเวอร์ชันเดิม",
    icon: "jiaobei",
    legacy: true,
  },
];

export const legacyQuickModules: ContentModule[] = [
  {
    href: "/NFCV.2/Seimsee/",
    eyebrow: "24 คำทำนาย",
    title: "เซียมซี",
    description: "เสี่ยงเซียมซีเวอร์ชันเดิม",
    icon: "seimsee",
    legacy: true,
  },
  {
    href: "/NFCV.2/number/",
    eyebrow: "ตัวเลขประจำจังหวะ",
    title: "เลขมงคล",
    description: "สุ่มเลขด้วยระบบเดิม",
    icon: "lucky-number",
    legacy: true,
  },
  {
    href: "/app/test1.html",
    eyebrow: "ระบบเดิม",
    title: "จุดธูปขอเลข",
    description: "เปิดแอปจุดธูปเวอร์ชันเดิม",
    icon: "incense",
    legacy: true,
  },
  {
    href: "/openday/",
    eyebrow: "จังหวะจันทรา",
    title: "ฤกษ์เปิดกระเป๋า",
    description: "ตรวจฤกษ์จากแอปเดิม",
    icon: "wallet-opening",
    legacy: true,
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
