import { BackLink, PageHero } from "../../../components/PageElements";
import { SeimseeTool } from "../../../components/FortuneTools";
export const metadata = { title: "เซียมซี" };
export default function Page() { return <><PageHero eyebrow="24 FORTUNE STICKS" title="สงบใจ แล้วรับคำทำนาย" description="คำทำนายเซียมซีดั้งเดิม 24 ใบของ Meemon ในประสบการณ์ใหม่ที่เรียบง่ายขึ้น"/><section className="content-section"><BackLink href="/v2/fortune" label="รวมคำทำนาย"/><SeimseeTool/></section></>; }
