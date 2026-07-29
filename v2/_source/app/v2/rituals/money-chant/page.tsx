import { BackLink, PageHero } from "../../../components/PageElements";
import { MoneyChantTool } from "../../../components/RitualTools";
export const metadata = { title: "คาถาเรียกเงิน" };
export default function Page() { return <><PageHero eyebrow="MONEY MANTRA" title="คาถาเรียกเงิน ฉบับ Meemon" description="ทบทวนบทคาถาและฟังเสียงต้นฉบับเพื่อเชื่อมพลังงาน"/><section className="content-section"><BackLink href="/v2/rituals" label="รวมพิธีมงคล"/><MoneyChantTool/></section></>; }
