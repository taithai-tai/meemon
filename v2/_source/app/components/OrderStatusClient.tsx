"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { commerceConfigured, fetchOrder } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import { isOrderAwaitingCustomer, rememberPublicOrder } from "@/lib/pending-orders";
import type { OrderStatus, PublicOrder } from "@/lib/types";
import { Icon } from "./Icons";
import { OrderPaymentPanel } from "./OrderPaymentPanel";

const statusCopy: Record<OrderStatus, { title: string; description: string; step: number }> = {
  pending_payment: { title: "รอชำระเงิน", description: "กรุณาโอนและอัปโหลดสลิปภายในเวลาที่กำหนด", step: 0 },
  verifying: { title: "กำลังตรวจสลิป", description: "ธนาคารหรือ EasySlip กำลังยืนยันรายการ", step: 1 },
  verification_failed: { title: "ตรวจสลิปไม่ผ่าน", description: "กลับไปหน้า Checkout จากอุปกรณ์เดิมเพื่ออัปโหลดใหม่ หรือติดต่อร้านค้า", step: 1 },
  needs_review: { title: "ร้านค้ากำลังตรวจสอบ", description: "สลิปนี้ต้องตรวจสอบเพิ่มเติม ร้านค้าจะดำเนินการโดยเร็ว", step: 1 },
  paid: { title: "ชำระเงินแล้ว", description: "ร้านค้าได้รับการยืนยันยอดแล้ว", step: 2 },
  packing: { title: "กำลังแพ็กสินค้า", description: "ออเดอร์กำลังเตรียมจัดส่ง", step: 3 },
  shipped: { title: "จัดส่งแล้ว", description: "สินค้าออกจากร้านแล้ว", step: 4 },
  completed: { title: "สำเร็จ", description: "ออเดอร์เสร็จสมบูรณ์", step: 5 },
  expired: { title: "หมดเวลาชำระ", description: "ออเดอร์นี้หมดเวลาแล้ว หากโอนไปแล้วกรุณาติดต่อร้านค้า", step: 0 },
  cancelled: { title: "ยกเลิกแล้ว", description: "ออเดอร์นี้ถูกยกเลิก", step: 0 },
  refunded: { title: "คืนเงินแล้ว", description: "ร้านค้าบันทึกสถานะคืนเงินแล้ว", step: 5 },
};

const steps = ["สร้างออเดอร์", "ตรวจชำระ", "รับชำระ", "แพ็กสินค้า", "จัดส่ง", "สำเร็จ"];

export function OrderStatusClient() {
  const token = useSearchParams().get("token") ?? "";
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!commerceConfigured || !token) {
      setError(!token ? "ลิงก์ติดตามออเดอร์ไม่ครบ" : "ระบบออเดอร์ยังไม่ได้เชื่อมต่อ");
      setLoading(false);
      return;
    }
    try {
      const result = await fetchOrder(token);
      setOrder(result.order);
      rememberPublicOrder(result.order, token);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "เปิดออเดอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 20_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  if (loading) return <div className="empty-state"><p>กำลังเปิดสถานะออเดอร์…</p></div>;
  if (!order) return <div className="empty-state"><span className="empty-icon"><Icon name="info" /></span><h2>เปิดออเดอร์ไม่ได้</h2><p>{error}</p><Link className="button button-gold" href="/v2/orders">ค้นหาออเดอร์เดิม</Link><Link className="continue-link" href="/v2/shop">กลับร้านค้า</Link></div>;
  const copy = statusCopy[order.status];
  return <div className="order-status-page">
    <section className="status-hero"><span className="status-icon"><Icon name={order.status === "completed" || order.status === "paid" ? "check" : "sparkle"} /></span><small>{order.orderNumber}</small><h2>{copy.title}</h2><p>{copy.description}</p><button type="button" className="button button-ghost" onClick={refresh}>อัปเดตสถานะ</button></section>
    <ol className="order-timeline">{steps.map((step, index) => <li className={index <= copy.step ? "active" : ""} key={step}><i>{index < copy.step ? <Icon name="check" /> : index + 1}</i><span>{step}</span></li>)}</ol>
    {isOrderAwaitingCustomer(order.status) ? <div className="order-resume-payment"><OrderPaymentPanel order={{ ...order, token }} onStatus={(status) => setOrder((current) => current ? { ...current, status } : current)} /></div> : null}
    <div className="checkout-layout order-details-grid"><section className="checkout-card"><small>ORDER ITEMS</small><h2>รายการสินค้า</h2>{order.items.map((item, index) => <div className="checkout-line" key={`${item.name}-${index}`}>{item.image ? <img src={item.image} alt="" /> : null}<span>{item.name}<small>{item.variant} · จำนวน {item.quantity}</small></span><strong>{formatPrice(item.lineTotalSatang / 100)}</strong></div>)}<div className="summary-total"><span>ยอดชำระ</span><strong>{formatPrice(order.totalSatang / 100)}</strong></div></section><aside className="cart-summary"><small>DELIVERY · THAILAND ONLY</small><h2>ที่อยู่จัดส่งในประเทศไทย</h2><div className="address-preview"><strong>{order.shipping.fullName}</strong><span>{order.shipping.phone}</span><p>{order.shipping.address}<br />{order.shipping.province} {order.shipping.postalCode}<br />ประเทศไทย</p></div><p className="checkout-disclaimer">หน้าติดตามนี้เป็นลิงก์ลับ โปรดอย่าส่งต่อ</p><Link className="continue-link" href="/v2/orders">กลับไปออเดอร์ของฉัน</Link></aside></div>
  </div>;
}
