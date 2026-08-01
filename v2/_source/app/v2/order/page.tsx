import { Suspense } from "react";
import { OrderStatusClient } from "../../components/OrderStatusClient";
import { PageHero } from "../../components/PageElements";

export const metadata = { title: "ติดตามคำสั่งซื้อ" };

export default function Page() {
  return <><PageHero eyebrow="PRIVATE ORDER TRACKING" title="ติดตามคำสั่งซื้อ" description="ดูสถานะและกลับมาอัปโหลดสลิปได้ แม้จะปิดหน้าชำระเงินไปแล้ว" /><section className="content-section"><Suspense fallback={<div className="empty-state">กำลังโหลด…</div>}><OrderStatusClient /></Suspense></section></>;
}
