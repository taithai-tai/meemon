import { BackLink, PageHero } from "../../../components/PageElements";
import { JiaobeiTool } from "../../../components/FortuneTools";
export const metadata = { title: "เซ้งปวย" };
export default function Page() { return <><PageHero eyebrow="DIVINATION BLOCKS" title="ถามให้ชัด แล้วปล่อยคำตอบ" description="ตั้งคำถามที่ตอบได้ว่าใช่หรือไม่ใช่ จากนั้นโยนไม้เสี่ยงทายทั้งสองชิ้น"/><section className="content-section"><BackLink href="/v2/fortune" label="รวมคำทำนาย"/><JiaobeiTool/></section></>; }
