import { BackLink, PageHero } from "../../components/PageElements";
import { CheckoutClient } from "../../components/CheckoutClient";
export const metadata = { title: "ชำระเงิน" };
export default function Page() { return <><PageHero eyebrow="SECURE GUEST CHECKOUT" title="กรอกเบอร์โทรและที่อยู่" description="จัดส่งฟรีเฉพาะในประเทศไทย · ระบบจะสร้างหน้าชำระเงินหลังตรวจข้อมูลสำหรับติดต่อและจัดส่งครบแล้ว"/><section className="content-section"><BackLink href="/v2/cart" label="กลับตะกร้า"/><CheckoutClient/></section></>; }
