"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import type { CheckoutDraft } from "@/lib/types";
import { useCart } from "./CartProvider";
import { Icon } from "./Icons";

const initialDraft: CheckoutDraft = { fullName: "", phone: "", address: "", province: "", postalCode: "", note: "" };

export function CheckoutClient() {
  const { items, subtotal, hydrated } = useCart();
  const [draft, setDraft] = useState(initialDraft);
  const [reviewed, setReviewed] = useState(false);
  function update(field: keyof CheckoutDraft, value: string) { setDraft((current) => ({ ...current, [field]: value })); }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setReviewed(true);
  }
  if (!hydrated) return <div className="empty-state"><p>กำลังเตรียม Checkout…</p></div>;
  if (!items.length) return <div className="empty-state"><span className="empty-icon"><Icon name="empty" /></span><h2>ไม่มีสินค้าให้ตรวจสอบ</h2><p>เพิ่มสินค้าลงตะกร้าก่อนเริ่ม Checkout</p><Link className="button button-gold" href="/v2/shop"><Icon name="shop" />ไปที่ร้านค้า</Link></div>;
  if (reviewed) return <div className="prototype-success"><span><Icon name="check" /></span><small>PROTOTYPE COMPLETE</small><h2>ทดสอบเส้นทาง Checkout สำเร็จ</h2><p>ข้อมูลที่กรอกไม่ได้ถูกส่งออกจากอุปกรณ์ ไม่มีออเดอร์ถูกสร้าง และไม่มีการเรียกเก็บเงินจริง</p><div><strong>ยอดทดลอง {formatPrice(subtotal)}</strong><span>{items.length} รายการ</span></div><button className="button button-ghost" onClick={() => setReviewed(false)}><Icon name="arrow-left" />กลับไปแก้ไข</button><Link className="button button-gold" href="/v2/shop"><Icon name="shop" />กลับร้านค้า</Link></div>;
  return (
    <form className="checkout-layout" onSubmit={submit}>
      <section className="checkout-card"><small>SHIPPING DRAFT</small><h2>ข้อมูลสำหรับตรวจสอบหน้าจอ</h2><div className="notice"><Icon name="shield" />ต้นแบบนี้เก็บข้อมูลในหน้าจอชั่วคราวเท่านั้น และจะไม่ส่งหรือบันทึกข้อมูลส่วนตัว</div><div className="checkout-fields"><div className="field"><label>ชื่อ–นามสกุล</label><input required value={draft.fullName} onChange={(e)=>update("fullName",e.target.value)} placeholder="ชื่อผู้รับ"/></div><div className="field"><label>เบอร์โทร</label><input required inputMode="tel" value={draft.phone} onChange={(e)=>update("phone",e.target.value)} placeholder="08x-xxx-xxxx"/></div><div className="field full-field"><label>ที่อยู่</label><textarea required value={draft.address} onChange={(e)=>update("address",e.target.value)} placeholder="บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต"/></div><div className="field"><label>จังหวัด</label><input required value={draft.province} onChange={(e)=>update("province",e.target.value)} /></div><div className="field"><label>รหัสไปรษณีย์</label><input required inputMode="numeric" pattern="[0-9]{5}" value={draft.postalCode} onChange={(e)=>update("postalCode",e.target.value)} /></div><div className="field full-field"><label>หมายเหตุ (ถ้ามี)</label><textarea value={draft.note} onChange={(e)=>update("note",e.target.value)} /></div></div></section>
      <aside className="cart-summary"><small>REVIEW</small><h2>ตรวจสอบรายการ</h2>{items.map((item)=><div className="checkout-line" key={item.key}><img src={item.image} alt=""/><span>{item.name}<small>จำนวน {item.quantity}</small></span><strong>{formatPrice(item.price*item.quantity)}</strong></div>)}<div className="summary-total"><span>ยอดทดลอง</span><strong>{formatPrice(subtotal)}</strong></div><button type="submit" className="button button-gold"><Icon name="check" />ยืนยันการทดสอบ</button><p className="checkout-disclaimer">ปุ่มนี้ไม่สั่งซื้อ ไม่ชำระเงิน และไม่ส่งข้อมูล</p></aside>
    </form>
  );
}
