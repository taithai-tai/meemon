import { BackLink, PageHero } from "../../components/PageElements";
import { WallpaperExplorer } from "../../components/WallpaperExplorer";
export const metadata = { title: "วอลเปเปอร์มงคล" };
export default function Page() { return <><PageHero eyebrow="46 LUCKY WALLPAPERS" title="คลังวอลเปเปอร์มงคล" description="รวมวอลเปเปอร์ทุกวันเกิดและทุกความปรารถนาในคลังเดียว เลือกดูและดาวน์โหลดได้ทันที"/><section className="content-section"><BackLink href="/" label="กลับหน้าแรก"/><WallpaperExplorer/></section></>; }
