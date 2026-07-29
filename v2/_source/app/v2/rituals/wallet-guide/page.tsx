import Link from "next/link";
import { BackLink, PageHero } from "../../../components/PageElements";
import { WalletGuide } from "../../../components/RitualTools";
import { Icon } from "../../../components/Icons";
export const metadata = { title: "คู่มือเปิดกระเป๋า" };
export default function Page() { return <><PageHero eyebrow="THE MYSTIC GUIDE" title="คู่มือเปิดกระเป๋าสตางค์ให้ปัง" description="เคล็ดลับเฉพาะที่จะเปลี่ยนกระเป๋าสตางค์ใบใหม่ให้เป็นขุมทรัพย์ดึงดูดพลังงานด้านบวก ด้วย 3 ขั้นตอนศักดิ์สิทธิ์"/><section className="content-section"><BackLink href="/v2/rituals" label="รวมพิธีมงคล"/><WalletGuide/><div className="guide-action"><Link href="/v2/rituals/money-chant" className="button button-gold"><Icon name="money" />เปิดคาถาเรียกเงิน<Icon name="arrow-right" /></Link></div></section></>; }
