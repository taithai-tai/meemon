import { BackLink, PageHero } from "../../../components/PageElements";
import { HorseChantTool } from "../../../components/RitualTools";
export const metadata = { title: "คาถาอัศวินพาหนะ" };
export default function Page() { return <><PageHero eyebrow="THE THREE ELEMENTAL HORSES" title="คาถาอัศวินพาหนะ" description="เลือกม้าแดง ม้าเบจ หรือม้าขาว แล้วสวดตามบทและจำนวนรอบจากคู่มือเดิม"/><section className="content-section"><BackLink href="/v2/rituals" label="รวมพิธีมงคล"/><HorseChantTool/></section></>; }
