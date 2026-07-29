import { BackLink, PageHero } from "../../../components/PageElements";
import { DailyTool } from "../../../components/FortuneTools";
export const metadata = { title: "ดวงประจำวัน" };
export default function Page() { return <><PageHero eyebrow="DAILY THAKSA & MOON" title="อ่านจังหวะของวัน และของคุณ" description="สำรวจพลังประจำวันผ่านวันเกิด หลักทักษา และข้างขึ้นข้างแรม"/><section className="content-section"><BackLink href="/v2/fortune" label="รวมคำทำนาย"/><DailyTool/></section></>; }
