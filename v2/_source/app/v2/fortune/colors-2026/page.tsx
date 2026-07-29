import { BackLink, PageHero } from "../../../components/PageElements";
import { ColorsTool } from "../../../components/FortuneTools";
export const metadata = { title: "สีมงคล 2026" };
export default function Page() { return <><PageHero eyebrow="LUCKY COLORS 2026" title="เลือกสีที่ส่งเสริมพลังของคุณ" description="สีมงคลตามวันเกิดสำหรับอำนาจ โชคลาภ การงาน และเมตตามหานิยม"/><section className="content-section"><BackLink href="/v2/fortune" label="รวมคำทำนาย"/><ColorsTool/></section></>; }
