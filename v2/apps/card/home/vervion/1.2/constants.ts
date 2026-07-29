import { FortuneCard, WallpaperDB, AspectOption } from './types';

export const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  flip: 'https://cdn.pixabay.com/audio/2022/03/10/audio_71e4fc8a6e.mp3',
  magic: 'https://cdn.pixabay.com/audio/2024/12/20/audio_d3efed8c6c.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

export const FORTUNE_CARDS: FortuneCard[] = [
  { name: "The Sun", icon: "☀️", meaning: "แสงสว่างแห่งปัญญาจักส่องทาง ความสำเร็จอันรุ่งโรจน์รออยู่เบื้องหน้า อุปสรรคจักมลายสิ้น", lucky: "1, 9" },
  { name: "The Lovers", icon: "❤️‍🔥", meaning: "ทางแยกแห่งโชคชะตา หัวใจจักนำทางเจ้า จงเลือกด้วยความรักมิใช่ความกลัว", lucky: "2, 6" },
  { name: "Wheel of Fortune", icon: "☸️", meaning: "กงล้อแห่งกรรมกำลังหมุน สิ่งใดที่ทำไว้จักย้อนคืน โอกาสใหม่จักปรากฏดั่งปาฏิหาริย์", lucky: "10" },
  { name: "The Magician", icon: "🔮", meaning: "อำนาจอยู่ในมือเจ้า ธาตุทั้งสี่จักเกื้อหนุน จงลงมือทำสิ่งที่คิดฝันให้เป็นจริง", lucky: "1, 5" },
  { name: "The Star", icon: "✨", meaning: "ความหวังดั่งดาราบนฟากฟ้า การเยียวยาจิตวิญญาณ ความสงบสุขจักบังเกิด", lucky: "17" },
  { name: "The Empress", icon: "👑", meaning: "ความอุดมสมบูรณ์พูนสุข เสน่ห์อันเหลือล้น ลาภยศสรรเสริญจักหลั่งไหลเข้ามา", lucky: "3" },
  { name: "Ace of Pentacles", icon: "💎", meaning: "ประตูขุมทรัพย์เปิดออก ลาภลอยหรือโอกาสทองทางการเงินจักเข้ามา จงไขว่คว้าไว้", lucky: "8" },
  { name: "The Moon", icon: "🌙", meaning: "ความลึกลับซ่อนเร้น จงเชื่อในสัญชาตญาณ ระวังภาพลวงตา แต่ความจริงจักเปิดเผยในไม่ช้า", lucky: "18" },
  { name: "Death", icon: "💀", meaning: "จุดจบคือการเริ่มต้นใหม่ การเปลี่ยนแปลงครั้งใหญ่จักนำพาชีวิตไปสู่หนทางที่ดีกว่าเดิม", lucky: "13" }
];

export const ASPECT_OPTIONS: Record<string, AspectOption> = {
  wealth: { id: 'wealth', label: 'มหาเศรษฐี', icon: '💰', sub: 'Wealth', colorClass: 'border-[#ffd700]', bgPattern: 'radial-gradient(circle at 50% 30%, #15803d 0%, #14532d 60%, #022c22 100%)' },
  love: { id: 'love', label: 'เสน่หา', icon: '💘', sub: 'Love', colorClass: 'border-[#f472b6]', bgPattern: 'radial-gradient(circle at 50% 30%, #db2777 0%, #9d174d 60%, #500724 100%)' },
  work: { id: 'work', label: 'การงาน', icon: '💼', sub: 'Work', colorClass: 'border-[#60a5fa]', bgPattern: 'radial-gradient(circle at 50% 30%, #2563eb 0%, #1e40af 60%, #172554 100%)' },
  health: { id: 'health', label: 'อายุวัฒนะ', icon: '🌿', sub: 'Health', colorClass: 'border-[#34d399]', bgPattern: 'radial-gradient(circle at 50% 30%, #10b981 0%, #047857 60%, #064e3b 100%)' },
  power: { id: 'power', label: 'อำนาจ', icon: '🦁', sub: 'Power', colorClass: 'border-[#fb923c]', bgPattern: 'radial-gradient(circle at 50% 30%, #ea580c 0%, #c2410c 60%, #7c2d12 100%)' },
  trade: { id: 'trade', label: 'ค้าขาย', icon: '⚖️', sub: 'Trade', colorClass: 'border-[#fb923c]', bgPattern: 'radial-gradient(circle at 50% 30%, #ea580c 0%, #c2410c 60%, #7c2d12 100%)' },
  education: { id: 'education', label: 'การเรียน', icon: '🎓', sub: 'Education', colorClass: 'border-[#818cf8]', bgPattern: 'radial-gradient(circle at 50% 30%, #4f46e5 0%, #4338ca 60%, #312e81 100%)' },
  mercy: { id: 'mercy', label: 'เมตตา', icon: '🤲', sub: 'Mercy', colorClass: 'border-[#e2e8f0]', bgPattern: 'radial-gradient(circle at 50% 30%, #94a3b8 0%, #64748b 60%, #475569 100%)' },
  luck: { id: 'luck', label: 'โชคลาภ', icon: '🍀', sub: 'Luck', colorClass: 'border-[#facc15]', bgPattern: 'radial-gradient(circle at 50% 30%, #ca8a04 0%, #a16207 60%, #713f12 100%)' },
  success: { id: 'success', label: 'ความสำเร็จ', icon: '🏆', sub: 'Success', colorClass: 'border-[#a855f7]', bgPattern: 'radial-gradient(circle at 50% 30%, #581c87 0%, #3b0764 60%, #1e1b4b 100%)', isNew: true },
  protection: { id: 'protection', label: 'แคล้วคลาด', icon: '🛡️', sub: 'Protection', colorClass: 'border-[#94a3b8]', bgPattern: 'radial-gradient(circle at 50% 30%, #475569 0%, #334155 60%, #0f172a 100%)', isNew: true },
  prestige: { id: 'prestige', label: 'บารมี', icon: '🎖️', sub: 'Prestige', colorClass: 'border-[#b91c1c]', bgPattern: 'radial-gradient(circle at 50% 30%, #991b1b 0%, #7f1d1d 60%, #450a0a 100%)', isNew: true },
  harmony: { id: 'harmony', label: 'ร่มเย็น', icon: '🕊️', sub: 'Harmony', colorClass: 'border-[#22c55e]', bgPattern: 'radial-gradient(circle at 50% 30%, #15803d 0%, #166534 60%, #064e3b 100%)', isNew: true },
  beginnings: { id: 'beginnings', label: 'เริ่มต้นใหม่', icon: '🌱', sub: 'Beginnings', colorClass: 'border-[#84cc16]', bgPattern: 'radial-gradient(circle at 50% 30%, #65a30d 0%, #4d7c0f 60%, #365314 100%)', isNew: true }
};

export const WALLPAPER_DB: WallpaperDB = {
    sunday: {
        wealth: "/v2/apps/card/Picture/%E0%B8%AD%E0%B8%B2%E0%B8%97%E0%B8%B4%E0%B8%95%E0%B8%A2%E0%B9%8C/S__2908233_0.jpg",
        love: "/v2/apps/card/Picture/%E0%B8%AD%E0%B8%B2%E0%B8%97%E0%B8%B4%E0%B8%95%E0%B8%A2%E0%B9%8C/S__2908234_0.jpg",
        work: "/v2/apps/card/Picture/%E0%B8%AD%E0%B8%B2%E0%B8%97%E0%B8%B4%E0%B8%95%E0%B8%A2%E0%B9%8C/S__2908235_0.jpg",
        health: "/v2/apps/card/Picture/%E0%B8%AD%E0%B8%B2%E0%B8%97%E0%B8%B4%E0%B8%95%E0%B8%A2%E0%B9%8C/S__2908236_0.jpg"
    },
    monday: {
        wealth: "/v2/apps/card/Picture/%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C/S__2908191_0.jpg",
        love: "/v2/apps/card/Picture/%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C/S__2908192_0.jpg",
        work: "/v2/apps/card/Picture/%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C/S__2908193_0.jpg",
        health: "/v2/apps/card/Picture/%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C/S__2908194_0.jpg"
    },
    tuesday: {
        wealth: "/v2/apps/card/Picture/%E0%B8%AD%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A3/S__2908197_0.jpg",
        love: "/v2/apps/card/Picture/%E0%B8%AD%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A3/S__2908198_0.jpg",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B1%87%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A3/S__2908199_0.jpg?raw=true",
        health: "/v2/apps/card/Picture/%E0%B8%AD%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A3/S__2908200_0.jpg"
    },
    wednesday_day: {
        wealth: "/v2/apps/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908204_0.jpg",
        love: "/v2/apps/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908203_0.jpg",
        work: "/v2/apps/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908205_0.jpg",
        health: "/v2/apps/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908206_0.jpg"
    },
    wednesday_night: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%84%E0%B8%B7%E0%B8%99/S__2908209_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908210_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908211_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908212_0.jpg?raw=true"
    },
    thursday: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%A4%A4%E0%B8%AB%E0%B8%B1%E0%B8%AA%E0%B8%9A%E0%B8%94%E0%B8%B5/S__2908215_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%A4%A4%E0%B8%AB%E0%B8%B1%E0%B8%AA%E0%B8%9A%E0%B8%94%E0%B8%B5/S__2908216_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%A4%A4%E0%B8%AB%E0%B8%B1%E0%B8%AA%E0%B8%9A%E0%B8%94%E0%B8%B5/S__2908217_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%A4%A4%E0%B8%AB%E0%B8%B1%E0%B8%AA%E0%B8%9A%E0%B8%94%E0%B8%B5/S__2908218_0.jpg?raw=true"
    },
    friday: {
        wealth: "/v2/apps/card/Picture/%E0%B8%A8%E0%B8%B8%E0%B8%81%E0%B8%A3%E0%B9%8C/S__2908221_0.jpg",
        love: "/v2/apps/card/Picture/%E0%B8%A8%E0%B8%B8%E0%B8%81%E0%B8%A3%E0%B9%8C/S__2908222_0.jpg",
        work: "/v2/apps/card/Picture/%E0%B8%A8%E0%B8%B8%E0%B8%81%E0%B8%A3%E0%B9%8C/S__2908223_0.jpg",
        health: "/v2/apps/card/Picture/%E0%B8%A8%E0%B8%B8%E0%B8%81%E0%B8%A3%E0%B9%8C/S__2908224_0.jpg"
    },
    saturday: {
        wealth: "/v2/apps/card/Picture/%E0%B9%80%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B9%8C/S__2908227_0.jpg",
        love: "/v2/apps/card/Picture/%E0%B9%80%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B9%8C/S__2908228_0.jpg",
        work: "/v2/apps/card/Picture/%E0%B9%80%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B9%8C/S__2908229_0.jpg",
        health: "/v2/apps/card/Picture/%E0%B9%80%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B9%8C/S__2908230_0.jpg"
    },
    anyday: {
        wealth: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908240_0.jpg",
        work: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908241_0.jpg",
        love: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908242_0.jpg",
        health: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908243_0.jpg",
        power: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908244_0.jpg",
        trade: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908245_0.jpg",
        education: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908246_0.jpg",
        mercy: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908248.jpg",
        luck: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908251.jpg",
        success: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785987.jpg",
        protection: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785988.jpg",
        prestige: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785989.jpg",
        harmony: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785990.jpg",
        beginnings: "/v2/apps/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785992.jpg"
    }
};

export const LOGO_URL = "/v2/apps/Picture/logo.png";
