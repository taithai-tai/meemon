"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { commerceConfigured, fetchOrder, lookupOrdersByPhone, recoverOrder, turnstileSiteKey } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import { isOrderAwaitingCustomer, PENDING_ORDERS_EVENT, readSavedOrders, rememberPublicOrder, type SavedOrder } from "@/lib/pending-orders";
import type { OrderStatus, PhoneOrderSummary } from "@/lib/types";
import { Icon } from "./Icons";
import { TurnstileWidget } from "./TurnstileWidget";

const statusLabel: Record<OrderStatus, string> = {
  pending_payment: "รอโอนและส่งสลิป", verifying: "กำลังตรวจสลิป", verification_failed: "กรุณาส่งสลิปใหม่",
  needs_review: "ร้านค้ากำลังตรวจสอบ", paid: "ชำระแล้ว", packing: "กำลังแพ็ก", shipped: "จัดส่งแล้ว",
  completed: "สำเร็จ", expired: "หมดเวลา — ส่งสลิปให้ร้านตรวจได้", cancelled: "ยกเลิกแล้ว", refunded: "คืนเงินแล้ว",
};

function SavedOrderCard({ order }: { order: SavedOrder }) {
  const awaiting = isOrderAwaitingCustomer(order.status);
  return <article className={`saved-order-card${awaiting ? " needs-action" : ""}`}>
    <div className="saved-order-icon"><Icon name={awaiting ? "scan" : "check"} /></div>
    <div className="saved-order-copy"><small>{new Date(order.createdAt).toLocaleString("th-TH")}</small><h3>{order.orderNumber}</h3><span className={`status-pill ${order.status}`}>{statusLabel[order.status]}</span></div>
    <div className="saved-order-total"><span>ยอดชำระ</span><strong>{formatPrice(order.totalSatang / 100)}</strong></div>
    <Link className={`button ${awaiting ? "button-gold" : "button-ghost"}`} href={`/v2/order/?token=${encodeURIComponent(order.token)}`}>{awaiting ? "ส่งสลิปต่อ" : "ดูออเดอร์"}<Icon name="arrow-right" /></Link>
  </article>;
}

function PhoneOrderCard({ order }: { order: PhoneOrderSummary }) {
  return <article className="phone-history-card">
    <header><div><small>{new Date(order.createdAt).toLocaleString("th-TH")}</small><h3>{order.orderNumber}</h3></div><span className={`status-pill ${order.status}`}>{statusLabel[order.status]}</span></header>
    <div className="phone-history-items">{order.items.map((item, index) => <div key={`${order.orderNumber}-${index}`}>
      {item.image ? <img src={item.image} alt="" /> : <span className="phone-history-placeholder"><Icon name="shop" /></span>}
      <p><strong>{item.name}</strong><small>{item.variant || "แบบมาตรฐาน"} · จำนวน {item.quantity}</small></p>
    </div>)}</div>
    <footer><span>ยอดรวม</span><strong>{formatPrice(order.totalSatang / 100)}</strong></footer>
  </article>;
}

export function MyOrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryCaptchaToken, setRecoveryCaptchaToken] = useState("");
  const [recoveryCaptchaReset, setRecoveryCaptchaReset] = useState(0);
  const [lookupCaptchaToken, setLookupCaptchaToken] = useState("");
  const [lookupCaptchaReset, setLookupCaptchaReset] = useState(0);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [phoneChecked, setPhoneChecked] = useState(false);
  const [phoneOrders, setPhoneOrders] = useState<PhoneOrderSummary[]>([]);

  const loadLocal = useCallback(() => {
    setOrders(readSavedOrders());
    setHydrated(true);
  }, []);

  useEffect(() => {
    loadLocal();
    window.addEventListener(PENDING_ORDERS_EVENT, loadLocal);
    window.addEventListener("storage", loadLocal);
    return () => {
      window.removeEventListener(PENDING_ORDERS_EVENT, loadLocal);
      window.removeEventListener("storage", loadLocal);
    };
  }, [loadLocal]);

  useEffect(() => {
    if (!hydrated || !commerceConfigured || !orders.length) return;
    let cancelled = false;
    Promise.allSettled(orders.map(async (saved) => {
      const result = await fetchOrder(saved.token);
      rememberPublicOrder(result.order, saved.token);
    })).finally(() => { if (!cancelled) setOrders(readSavedOrders()); });
    return () => { cancelled = true; };
  }, [hydrated]);

  async function submitPhoneLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupMessage("");
    if (!lookupCaptchaToken) return setLookupMessage("กรุณายืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ");
    setBusy(true);
    try {
      const result = await lookupOrdersByPhone(phoneQuery, lookupCaptchaToken);
      setPhoneOrders(result.orders);
      setPhoneChecked(true);
    } catch (reason) {
      setLookupMessage(reason instanceof Error ? reason.message : "ค้นหาออเดอร์ไม่สำเร็จ");
      setPhoneOrders([]);
      setPhoneChecked(false);
    } finally {
      setBusy(false);
      setLookupCaptchaToken("");
      setLookupCaptchaReset((value) => value + 1);
    }
  }

  async function submitRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecoveryMessage("");
    if (!recoveryCaptchaToken) return setRecoveryMessage("กรุณายืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ");
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const result = await recoverOrder(String(form.get("orderNumber")), String(form.get("phone")), recoveryCaptchaToken);
      rememberPublicOrder(result.order, result.token);
      router.push(`/v2/order/?token=${encodeURIComponent(result.token)}`);
    } catch (reason) {
      setRecoveryMessage(reason instanceof Error ? reason.message : "ค้นหาออเดอร์ไม่สำเร็จ");
      setRecoveryCaptchaToken("");
      setRecoveryCaptchaReset((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) return <div className="empty-state"><p>กำลังเปิดออเดอร์ของคุณ…</p></div>;

  return <div className="my-orders-page">
    <section className="order-recovery-card phone-order-lookup">
      <div className="recovery-copy"><span className="recovery-icon"><Icon name="search" /></span><small>MY ORDER APP</small><h2>เช็กออเดอร์ด้วยเบอร์โทร</h2><p>ค้นหาจากฐานข้อมูลร้านได้จากทุกโทรศัพท์ ทุกคอมพิวเตอร์ และทุกเครือข่าย จะแสดงรายการสินค้าและสถานะล่าสุดของทุกออเดอร์ที่ใช้เบอร์นี้</p></div>
      <form className="order-recovery-form" onSubmit={submitPhoneLookup}>
        <label>เบอร์โทรศัพท์มือถือ<input value={phoneQuery} onChange={(event) => { setPhoneQuery(event.target.value); setPhoneChecked(false); }} required inputMode="tel" autoComplete="tel" maxLength={16} pattern="[0-9+ -]{9,16}" placeholder="08x-xxx-xxxx" /></label>
        <TurnstileWidget siteKey={turnstileSiteKey} resetKey={lookupCaptchaReset} onToken={setLookupCaptchaToken} />
        {lookupMessage ? <div className="form-error">{lookupMessage}</div> : null}
        <button className="button button-gold" disabled={busy || !commerceConfigured || !lookupCaptchaToken}>{busy ? "กำลังค้นหา…" : "ดูออเดอร์ทั้งหมดของเบอร์นี้"}<Icon name="arrow-right" /></button>
      </form>
    </section>

    {phoneChecked && phoneOrders.length ? <section className="orders-section"><div className="section-heading compact"><div><small>ORDER HISTORY</small><h2>ออเดอร์ทั้งหมดของเบอร์นี้</h2></div><span className="order-count-badge">{phoneOrders.length}</span></div><div className="phone-history-list">{phoneOrders.map((order) => <PhoneOrderCard key={order.orderNumber} order={order} />)}</div></section> : null}

    {phoneChecked && !phoneOrders.length ? <div className="empty-state compact-empty"><span className="empty-icon"><Icon name="empty" /></span><h2>ไม่พบออเดอร์ของเบอร์นี้</h2><p>ตรวจสอบหมายเลขโทรศัพท์แล้วลองค้นหาอีกครั้ง</p></div> : null}

    {orders.length ? <section className="orders-section"><div className="section-heading compact"><div><small>THIS DEVICE</small><h2>ออเดอร์ที่เปิดไว้ในอุปกรณ์นี้</h2></div></div><div className="saved-order-list">{orders.map((order) => <SavedOrderCard key={order.token} order={order} />)}</div></section> : null}

    <section className="order-recovery-card">
      <div className="recovery-copy"><span className="recovery-icon"><Icon name="shield" /></span><small>OPEN AN ORDER</small><h2>เปิดรายละเอียดหรือส่งสลิปต่อ</h2><p>นำเลขออเดอร์จากผลค้นหาด้านบนมากรอกคู่กับเบอร์โทร เพื่อเปิดหน้ารายละเอียดหรือส่งสลิปจากอุปกรณ์นี้</p></div>
      <form className="order-recovery-form" onSubmit={submitRecovery}>
        <label>เลขออเดอร์<input name="orderNumber" required autoCapitalize="characters" placeholder="MM20260801-001001" pattern="MM[0-9]{8}-[0-9]{6}" /></label>
        <label>เบอร์โทรศัพท์มือถือ<input name="phone" required inputMode="tel" autoComplete="tel" maxLength={16} pattern="[0-9+ -]{9,16}" placeholder="08x-xxx-xxxx" /></label>
        <TurnstileWidget siteKey={turnstileSiteKey} resetKey={recoveryCaptchaReset} onToken={setRecoveryCaptchaToken} />
        {!commerceConfigured ? <div className="form-error">ระบบค้นหาออเดอร์จะเปิดหลังเชื่อมต่อ Supabase และ Turnstile</div> : null}
        {recoveryMessage ? <div className="form-error">{recoveryMessage}</div> : null}
        <button className="button button-gold" disabled={busy || !commerceConfigured || !recoveryCaptchaToken}>{busy ? "กำลังค้นหา…" : "เปิดออเดอร์"}<Icon name="arrow-right" /></button>
      </form>
    </section>
  </div>;
}
