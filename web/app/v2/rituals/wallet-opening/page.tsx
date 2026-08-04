import { BackLink, PageHero } from "../../../components/PageElements";
import { WalletOpeningTool } from "../../../components/RitualTools";
export const metadata = { title: "ฤกษ์เปิดกระเป๋า" };
export default function Page() { return <><PageHero eyebrow="LUNAR WALLET CALENDAR" title="เลือกวันเริ่มใช้กระเป๋าใบใหม่" description="ตรวจจังหวะข้างขึ้นและข้างแรมตามหลักเดิมของคู่มือ Meemon"/><section className="content-section"><BackLink href="/v2/rituals" label="รวมพิธีมงคล"/><WalletOpeningTool/></section></>; }
