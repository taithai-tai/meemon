"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { commerceConfigured, fetchOrder, recoverOrder, turnstileSiteKey } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import { isOrderAwaitingCustomer, PENDING_ORDERS_EVENT, readSavedOrders, rememberPublicOrder, type SavedOrder } from "@/lib/pending-orders";
import type { OrderStatus } from "@/lib/types";
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

export function MyOrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [phoneChecked, setPhoneChecked] = useState(false);

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

  const normalizedPhone = phoneQuery.replace(/\D/g, "").replace(/^66(?=\d{9}$)/, "0");
  const visibleOrders = useMemo(() => phoneChecked
    ? orders.filter((order) => (order.phone ?? "").replace(/\D/g, "").replace(/^66(?=\d{9}$)/, "0") === normalizedPhone)
    : [], [orders, phoneChecked, normalizedPhone]);
  const awaiting = useMemo(() => visibleOrders.filter((order) => isOrderAwaitingCustomer(order.status)), [visibleOrders]);
  const other = useMemo(() => visibleOrders.filter((order) => !isOrderAwaitingCustomer(order.status)), [visibleOrders]);

  async function submitRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!captchaToken) return setMessage("กรุณายืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ");
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const result = await recoverOrder(String(form.get("orderNumber")), String(form.get("phone")), captchaToken);
      rememberPublicOrder(result.order, result.token);
      router.push(`/v2/order/?token=${encodeURIComponent(result.token)}`);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "ค้นหาออเดอร์ไม่สำเร็จ");
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) return <div className="empty-state"><p>กำลังเปิดออเดอร์ของคุณ…</p></div>;

  return <div className="my-orders-page">
    <section className="order-recovery-card phone-order-lookup">
      <div className="recovery-copy"><span className="recovery-icon"><Icon name="search" /></span><small>MY ORDER APP</small><h2>เช็กออเดอร์ด้วยเบอร์โทร</h2><p>กรอกเบอร์เดียวกับที่ใช้สั่งซื้อ เพื่อดูออเดอร์ทั้งหมดที่บันทึกไว้บนอุปกรณ์นี้ รวมถึงรายการที่ยังไม่ได้ส่งสลิป</p></div>
      <form className="order-recovery-form" onSubmit={(event) => { event.preventDefault(); setPhoneChecked(true); }}>
        <label>เบอร์โทรศัพท์มือถือ<input value={phoneQuery} onChange={(event) => { setPhoneQuery(event.target.value); setPhoneChecked(false); }} required inputMode="tel" autoComplete="tel" maxLength={16} pattern="[0-9+ -]{9,16}" placeholder="08x-xxx-xxxx" /></label>
        <button className="button button-gold">ดูออเดอร์ทั้งหมดของฉัน<Icon name="arrow-right" /></button>
      </form>
    </section>

    {phoneChecked && awaiting.length ? <section className="orders-section"><div className="section-heading compact"><div><small>ACTION REQUIRED</small><h2>ออเดอร์ที่ยังส่งสลิปไม่เสร็จ</h2></div><span className="order-count-badge">{awaiting.length}</span></div><div className="saved-order-list">{awaiting.map((order) => <SavedOrderCard key={order.token} order={order} />)}</div></section> : null}

    {phoneChecked && other.length ? <section className="orders-section"><div className="section-heading compact"><div><small>ORDER HISTORY</small><h2>ประวัติออเดอร์ของเบอร์นี้</h2></div></div><div className="saved-order-list">{other.map((order) => <SavedOrderCard key={order.token} order={order} />)}</div></section> : null}

    {phoneChecked && !visibleOrders.length ? <div className="empty-state compact-empty"><span className="empty-icon"><Icon name="empty" /></span><h2>ไม่พบออเดอร์ของเบอร์นี้บนอุปกรณ์</h2><p>หากสั่งจากโทรศัพท์หรือคอมพิวเตอร์เครื่องอื่น ให้ใช้เลขออเดอร์และเบอร์โทรในส่วนกู้รายการด้านล่าง</p></div> : null}

    <section className="order-recovery-card">
      <div className="recovery-copy"><span className="recovery-icon"><Icon name="shield" /></span><small>RECOVER AN ORDER</small><h2>กู้ออเดอร์จากเครื่องอื่น</h2><p>เพื่อไม่ให้คนที่เดาเบอร์โทรได้เห็นชื่อและที่อยู่ของคุณ การเปิดออเดอร์ข้ามอุปกรณ์ต้องใช้ทั้งเลขออเดอร์และเบอร์โทรศัพท์ที่กรอกตอนสั่ง</p></div>
      <form className="order-recovery-form" onSubmit={submitRecovery}>
        <label>เลขออเดอร์<input name="orderNumber" required autoCapitalize="characters" placeholder="MM20260801-001001" pattern="MM[0-9]{8}-[0-9]{6}" /></label>
        <label>เบอร์โทรศัพท์มือถือ<input name="phone" required inputMode="tel" autoComplete="tel" maxLength={16} pattern="[0-9+ -]{9,16}" placeholder="08x-xxx-xxxx" /></label>
        <TurnstileWidget siteKey={turnstileSiteKey} resetKey={captchaReset} onToken={setCaptchaToken} />
        {!commerceConfigured ? <div className="form-error">ระบบค้นหาออเดอร์จะเปิดหลังเชื่อมต่อ Supabase และ Turnstile</div> : null}
        {message ? <div className="form-error">{message}</div> : null}
        <button className="button button-gold" disabled={busy || !commerceConfigured || !captchaToken}>{busy ? "กำลังค้นหา…" : "เปิดออเดอร์ของฉัน"}<Icon name="arrow-right" /></button>
      </form>
    </section>
  </div>;
}
