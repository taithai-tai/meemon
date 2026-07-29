import { BackLink, PageHero } from "../../../components/PageElements";
import { OracleTool } from "../../../components/FortuneTools";
export const metadata = { title: "ไพ่ออราเคิล" };
export default function Page() { return <><PageHero eyebrow="ONE CARD ORACLE" title="ข้อความที่วันนี้อยากบอกคุณ" description="นึกถึงหนึ่งคำถาม แล้วเปิดไพ่ออราเคิลเพื่อรับคำแนะนำและเลขมงคล"/><section className="content-section"><BackLink href="/v2/fortune" label="รวมคำทำนาย"/><OracleTool/></section></>; }
