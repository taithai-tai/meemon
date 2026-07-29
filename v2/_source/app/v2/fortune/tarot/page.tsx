import { BackLink, PageHero } from "../../../components/PageElements";
import { TarotTool } from "../../../components/FortuneTools";
export const metadata = { title: "ไพ่ทาโรต์" };
export default function Page() { return <><PageHero eyebrow="THE 78-CARD DECK" title="ไพ่หนึ่งสำรับ หลายมุมมอง" description="รวมการเปิดไพ่ 1 ใบ 3 ใบ และ 10 ใบไว้ในโมดูลเดียว เลือกจำนวนที่เหมาะกับคำถามของคุณ"/><section className="content-section wide-content"><BackLink href="/v2/fortune" label="รวมคำทำนาย"/><TarotTool/></section></>; }
