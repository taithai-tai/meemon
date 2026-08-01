"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { commerceConfigured, createOrder, turnstileSiteKey } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import { isOrderAwaitingCustomer, readSavedOrders, rememberOrder } from "@/lib/pending-orders";
import type { CheckoutDraft, OrderStatus, PaymentAccountSnapshot } from "@/lib/types";
import { useCart } from "./CartProvider";
import { Icon } from "./Icons";
import { OrderPaymentPanel } from "./OrderPaymentPanel";
import { TurnstileWidget } from "./TurnstileWidget";

const initialDraft: CheckoutDraft = { fullName: "", phone: "", address: "", province: "", postalCode: "", note: "" };

interface CreatedOrder {
  orderId?: string;
  orderNumber: string;
  phone?: string;
  totalSatang: number;
  expiresAt: string;
  paymentAccount: PaymentAccountSnapshot;
  token: string;
  status: OrderStatus;
  createdAt: string;
}

const thaiProvinces = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"];

export function CheckoutClient() {
  const { items, subtotal, hydrated, clearCart } = useCart();
  const [draft, setDraft] = useState(initialDraft);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [savedAwaitingCount, setSavedAwaitingCount] = useState(0);

  useEffect(() => {
    if (!hydrated || order) return;
    const awaiting = readSavedOrders().filter((saved) => isOrderAwaitingCustomer(saved.status));
    setSavedAwaitingCount(awaiting.length);
    if (!items.length && awaiting[0]) setOrder(awaiting[0]);
  }, [hydrated, items.length, order]);

  function update(field: keyof CheckoutDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!commerceConfigured) return setError("ระบบรับออเดอร์ยังไม่ได้เชื่อม Supabase, EasySlip และ Turnstile จึงยังไม่สามารถรับโอนเงินจริงได้");
    if (!captchaToken) return setError("กรุณายืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ");
    setBusy(true);
    try {
      const response = await createOrder(draft, items, captchaToken);
      const created: CreatedOrder = { ...response, phone: draft.phone, status: "pending_payment", createdAt: new Date().toISOString() };
      rememberOrder(created);
      setOrder(created);
      clearCart();
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "สร้างคำสั่งซื้อไม่สำเร็จ");
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) return <div className="empty-state"><p>กำลังเตรียม Checkout…</p></div>;

  if (verified && order) {
    return <div className="prototype-success live-success"><span><Icon name="check" /></span><small>PAYMENT VERIFIED</small><h2>ตรวจสอบการชำระเงินสำเร็จ</h2><p>ร้านค้าได้รับออเดอร์แล้ว คุณสามารถเปิดลิงก์ติดตามนี้ได้โดยไม่ต้องสมัครสมาชิก</p><div><strong>{order.orderNumber}</strong><span>ยอดชำระ {formatPrice(order.totalSatang / 100)}</span></div><Link className="button button-gold" href={`/v2/order/?token=${encodeURIComponent(order.token)}`}>ติดตามคำสั่งซื้อ<Icon name="arrow-right" /></Link></div>;
  }

  if (order) {
    return <div className="checkout-layout payment-layout">
      <OrderPaymentPanel order={order} onStatus={(status) => { setOrder((current) => current ? { ...current, status } : current); setVerified(status === "paid"); }} />
      <aside className="cart-summary payment-summary"><small>ORDER SAVED</small><h2>กลับมาส่งสลิปได้</h2><p className="checkout-disclaimer">ออเดอร์นี้ถูกเก็บใน “ออเดอร์ของฉัน” บนอุปกรณ์นี้แล้ว หากปิดหน้านี้ คุณสามารถกลับมาอัปโหลดสลิปภายหลังได้</p><Link className="button button-ghost" href={`/v2/order/?token=${encodeURIComponent(order.token)}`}>เปิดหน้าติดตามออเดอร์</Link><Link className="continue-link" href="/v2/orders">ดูออเดอร์ของฉันทั้งหมด</Link><div className="summary-total"><span>ค่าจัดส่งในไทย</span><strong>ฟรี</strong></div></aside>
    </div>;
  }

  if (!items.length) return <div className="empty-state"><span className="empty-icon"><Icon name="empty" /></span><h2>ไม่มีสินค้าให้ตรวจสอบ</h2><p>เพิ่มสินค้าลงตะกร้าก่อนเริ่ม Checkout</p><Link className="button button-gold" href="/v2/shop"><Icon name="shop" />ไปที่ร้านค้า</Link></div>;

  return <>{savedAwaitingCount ? <div className="pending-order-banner"><span><Icon name="info" /></span><div><strong>คุณมี {savedAwaitingCount} ออเดอร์ที่ยังส่งสลิปไม่เสร็จ</strong><p>เปิดออเดอร์เดิมเพื่อดูบัญชีและอัปโหลดสลิปต่อได้</p></div><Link className="button button-ghost" href="/v2/orders">เปิดออเดอร์ของฉัน</Link></div> : null}<form className="checkout-layout" onSubmit={submitOrder}>
    <section className="checkout-card">
      <div className="checkout-stage-label"><span>1</span><div><small>GUEST CHECKOUT</small><h2>ข้อมูลสำหรับจัดส่ง</h2></div></div>
      <div className="notice"><Icon name="shield" />กรอกเบอร์โทรศัพท์ก่อนเข้าสู่หน้าชำระเงิน เพื่อใช้ติดต่อเมื่อออเดอร์มีปัญหาและใช้ร่วมกับเลขออเดอร์เมื่อต้องการกู้รายการเดิม</div>
      <div className="checkout-fields">
        <div className="field"><label htmlFor="checkout-name">ชื่อ–นามสกุล</label><input id="checkout-name" required maxLength={120} autoComplete="name" value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="ชื่อผู้รับ" /></div>
        <div className="field phone-required-field"><label htmlFor="checkout-phone">เบอร์โทรศัพท์มือถือ <strong>จำเป็น</strong></label><input id="checkout-phone" required maxLength={16} inputMode="tel" autoComplete="tel" pattern="[0-9+ -]{9,16}" value={draft.phone} onChange={(event) => update("phone", event.target.value)} placeholder="08x-xxx-xxxx" /><small>รองรับหมายเลขมือถือไทย 06, 08 หรือ 09</small></div>
        <div className="shipping-country-lock full-field"><Icon name="shield" /><div><strong>จัดส่งเฉพาะในประเทศไทยเท่านั้น</strong><span>ไม่รองรับที่อยู่หรือรหัสไปรษณีย์ต่างประเทศ</span></div></div>
        <div className="field full-field"><label htmlFor="checkout-address">ที่อยู่จัดส่งในประเทศไทย</label><textarea id="checkout-address" required maxLength={500} autoComplete="street-address" value={draft.address} onChange={(event) => update("address", event.target.value)} placeholder="บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต" /></div>
        <div className="field"><label htmlFor="checkout-province">จังหวัด</label><select id="checkout-province" required autoComplete="address-level1" value={draft.province} onChange={(event) => update("province", event.target.value)}><option value="">เลือกจังหวัด</option>{thaiProvinces.map((province) => <option key={province}>{province}</option>)}</select></div>
        <div className="field"><label htmlFor="checkout-postal">รหัสไปรษณีย์</label><input id="checkout-postal" required inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" value={draft.postalCode} onChange={(event) => update("postalCode", event.target.value)} placeholder="10110" /></div>
        <div className="field full-field"><label htmlFor="checkout-note">หมายเหตุ (ถ้ามี)</label><textarea id="checkout-note" maxLength={500} value={draft.note} onChange={(event) => update("note", event.target.value)} placeholder="รายละเอียดเพิ่มเติมสำหรับการจัดส่ง" /></div>
      </div>
      <TurnstileWidget siteKey={turnstileSiteKey} resetKey={captchaReset} onToken={setCaptchaToken} />
      {!commerceConfigured ? <div className="form-error">โหมดรับเงินจริงยังไม่เปิด: ต้องตั้งค่า Supabase, EasySlip และ Turnstile ก่อน</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
    </section>
    <aside className="cart-summary"><small>ORDER REVIEW</small><h2>ตรวจสอบรายการ</h2>{items.map((item) => <div className="checkout-line" key={item.key}><img src={item.image} alt="" /><span>{item.name}<small>จำนวน {item.quantity}</small></span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}<div><span>ค่าจัดส่ง</span><strong>ฟรี</strong></div><div className="summary-total"><span>ยอดประมาณการ</span><strong>{formatPrice(subtotal)}</strong></div><button type="submit" className="button button-gold" disabled={busy || !commerceConfigured || !captchaToken}>{busy ? "กำลังสร้างออเดอร์…" : "สร้างออเดอร์และดูบัญชีโอน"}<Icon name="arrow-right" /></button><p className="checkout-disclaimer">เมื่อกด ระบบจะยืนยันราคาจริงและสร้างออเดอร์ โดยไม่มีเวลาหมดอายุในการโอน</p></aside>
  </form></>;
}
