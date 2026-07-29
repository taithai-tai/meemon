"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/data";
import { useCart } from "./CartProvider";
import { Icon } from "./Icons";

export function CartClient() {
  const { items, subtotal, hydrated, updateQuantity, removeItem, clearCart } = useCart();
  if (!hydrated) return <div className="empty-state"><p>กำลังเปิดตะกร้า…</p></div>;
  if (!items.length) return <div className="empty-state"><div className="empty-icon"><Icon name="empty" /></div><h2>ตะกร้ายังว่าง</h2><p>เลือกสิ่งมงคลที่เหมาะกับคุณจากคอลเลกชัน Meemon</p><Link className="button button-gold" href="/v2/shop"><Icon name="shop" />สำรวจร้านค้า<Icon name="arrow-right" /></Link></div>;
  return (
    <div className="cart-layout">
      <div className="cart-list">
        {items.map((item) => <article className="cart-item" key={item.key}>
          <Link href={`/v2/shop/${item.slug}`}><img src={item.image} alt={item.name}/></Link>
          <div className="cart-item-copy"><Link href={`/v2/shop/${item.slug}`}><h3>{item.name}</h3></Link>{Object.entries(item.selections).length ? <p>{Object.entries(item.selections).map(([group, value]) => `${group}: ${value}`).join(" · ")}</p> : null}<strong>{formatPrice(item.price)}</strong></div>
          <div className="quantity-picker"><button onClick={() => updateQuantity(item.key,item.quantity-1)} aria-label="ลดจำนวน"><Icon name="minus" /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.key,item.quantity+1)} aria-label="เพิ่มจำนวน"><Icon name="plus" /></button></div>
          <div className="cart-line-total">{formatPrice(item.price * item.quantity)}</div>
          <button className="remove-button" onClick={() => removeItem(item.key)} aria-label={`นำ ${item.name} ออกจากตะกร้า`}><Icon name="trash" /></button>
        </article>)}
        <button className="text-button" onClick={clearCart}>ล้างตะกร้า</button>
      </div>
      <aside className="cart-summary"><small>ORDER SUMMARY</small><h2>สรุปตะกร้า</h2><div><span>ยอดรวมสินค้า</span><strong>{formatPrice(subtotal)}</strong></div><div><span>ค่าจัดส่ง</span><span>คำนวณในขั้นถัดไป</span></div><div className="summary-total"><span>ยอดประมาณการ</span><strong>{formatPrice(subtotal)}</strong></div><div className="notice"><Icon name="info" />Checkout นี้เป็นต้นแบบเท่านั้น ระบบจะไม่สร้างออเดอร์ ไม่ส่งข้อมูลส่วนตัว และไม่รับเงินจริง</div><Link href="/v2/checkout" className="button button-gold">ไปยัง Checkout ทดลอง<Icon name="arrow-right" /></Link><Link href="/v2/shop" className="continue-link">เลือกสินค้าต่อ</Link></aside>
    </div>
  );
}
