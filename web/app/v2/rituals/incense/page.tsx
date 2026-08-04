import { BackLink, PageHero } from "../../../components/PageElements";
import { IncenseTool } from "../../../components/RitualTools";
export const metadata = { title: "จุดธูปขอเลขมงคล" };
export default function Page() { return <><PageHero eyebrow="FREE INCENSE RITUAL" title="ตั้งจิต จุดธูป รับเลขมงคล" description="พิธีขอเลขแบบใหม่ของ Meemon เปิดใช้ฟรี ไม่ใช้แต้ม ไม่มีสมาชิก และไม่มีร้านธูป"/><section className="content-section"><BackLink href="/v2/rituals" label="รวมพิธีมงคล"/><IncenseTool/></section></>; }
