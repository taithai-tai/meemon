"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchOrder } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import { rememberPublicOrder } from "@/lib/pending-orders";
import type { PublicOrder } from "@/lib/types";
import { Icon } from "./Icons";

export function PaymentSuccessClient() {
  const [token, setToken] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);

  useEffect(() => {
    const publicToken = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(publicToken);
    if (!publicToken) return;
    fetchOrder(publicToken).then(({ order: found }) => {
      rememberPublicOrder(found, publicToken);
      setOrder(found);
    }).catch(() => setOrder(null));
  }, []);

  return <section className="prototype-success live-success payment-success-page">
    <span><Icon name="check" /></span>
    <small>PAYMENT VERIFIED</small>
    <h1>โอนเงินสำเร็จ</h1>
    <h2>ระบบตรวจสอบสลิปสำเร็จแล้ว</h2>
    <p>ร้านค้าได้รับการชำระเงินและออเดอร์ของคุณแล้ว ขั้นตอนถัดไปคือการจัดเตรียมสินค้าเพื่อจัดส่ง</p>
    {order ? <div><strong>{order.orderNumber}</strong><span>ยอดชำระ {formatPrice(order.totalSatang / 100)}</span></div> : null}
    <div className="payment-success-actions">
      {token ? <Link className="button button-gold" href={`/v2/order/?token=${encodeURIComponent(token)}`}>ดูสถานะออเดอร์นี้<Icon name="arrow-right" /></Link> : null}
      <Link className="button button-ghost" href="/v2/orders">เปิดแอป “ออเดอร์ของฉัน”</Link>
      <Link className="continue-link" href="/v2/">กลับหน้าหลัก Meemon</Link>
    </div>
    <p className="payment-success-help">ครั้งถัดไปเปิด “ออเดอร์ของฉัน” จากหน้าหลัก แล้วใช้เบอร์โทรศัพท์ที่กรอกตอนสั่งซื้อเพื่อตรวจสอบรายการของคุณ</p>
  </section>;
}
