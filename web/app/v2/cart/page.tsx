import { PageHero } from "../../components/PageElements";
import { CartClient } from "../../components/CartClient";
export const metadata = { title: "ตะกร้า" };
export default function Page() { return <><PageHero eyebrow="YOUR SELECTION" title="ตะกร้าของคุณ" description="สินค้าที่เลือกจะถูกเก็บไว้เฉพาะในระบบ Meemon V2 บนอุปกรณ์นี้"/><section className="content-section"><CartClient/></section></>; }
