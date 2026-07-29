import { BackLink, PageHero } from "../../../components/PageElements";
import { LuckyNumberTool } from "../../../components/FortuneTools";
export const metadata = { title: "เลขมงคล 4 หลัก" };
export default function Page() { return <><PageHero eyebrow="FOUR LUCKY DIGITS" title="สี่ตัวเลข สำหรับจังหวะวันนี้" description="ให้ตัวเลขค่อย ๆ เปิดทีละหลัก เป็นสัญลักษณ์และแรงบันดาลใจสำหรับคุณ"/><section className="content-section"><BackLink href="/v2/fortune" label="รวมคำทำนาย"/><LuckyNumberTool/></section></>; }
