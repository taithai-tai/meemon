import { BackLink, PageHero } from "../../components/PageElements";
import { CheckoutClient } from "../../components/CheckoutClient";
export const metadata = { title: "Checkout ทดลอง" };
export default function Page() { return <><PageHero eyebrow="CHECKOUT PROTOTYPE" title="ทดลองเส้นทาง Checkout" description="ตรวจสอบประสบการณ์ตั้งแต่ตะกร้าถึงหน้าสรุป โดยไม่สร้างออเดอร์ ไม่ส่งข้อมูล และไม่รับเงินจริง"/><section className="content-section"><BackLink href="/v2/cart" label="กลับตะกร้า"/><CheckoutClient/></section></>; }
