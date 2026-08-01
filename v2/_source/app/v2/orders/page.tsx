import { MyOrdersClient } from "../../components/MyOrdersClient";
import { PageHero } from "../../components/PageElements";

export const metadata = { title: "ออเดอร์ของฉัน" };

export default function Page() {
  return <><PageHero eyebrow="YOUR MEEMON ORDERS" title="ออเดอร์ของฉัน" description="กรอกเบอร์โทรเพื่อกลับมาโอนเงิน อัปโหลดสลิป และติดตามออเดอร์ได้ แม้จะปิดหน้าชำระเงินไปแล้ว" /><section className="content-section"><MyOrdersClient /></section></>;
}
