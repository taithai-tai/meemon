"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/data";
import type { CheckoutDraft } from "@/lib/types";
import { useCart } from "./CartProvider";
import { Icon } from "./Icons";

const initialDraft: CheckoutDraft = {
  fullName: "",
  phone: "",
  address: "",
  province: "",
  postalCode: "",
  note: "",
};

const mockQrCells = Array.from({ length: 225 }, (_, index) => {
  const row = Math.floor(index / 15);
  const column = index % 15;
  const finder =
    ((row <= 4 && column <= 4) ||
      (row <= 4 && column >= 10) ||
      (row >= 10 && column <= 4)) &&
    (row % 4 !== 1 || column % 4 !== 1);
  const decorativeNoise = (row * 7 + column * 11 + row * column) % 9 < 4;
  return finder || decorativeNoise;
});

type CheckoutStage = "details" | "payment" | "complete";

export function CheckoutClient() {
  const { items, subtotal, hydrated } = useCart();
  const [draft, setDraft] = useState(initialDraft);
  const [stage, setStage] = useState<CheckoutStage>("details");
  const [qrVisible, setQrVisible] = useState(false);

  function update(field: keyof CheckoutDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function continueToPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStage("payment");
    setQrVisible(false);
  }

  if (!hydrated) {
    return (
      <div className="empty-state">
        <p>กำลังเตรียม Checkout…</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">
          <Icon name="empty" />
        </span>
        <h2>ไม่มีสินค้าให้ตรวจสอบ</h2>
        <p>เพิ่มสินค้าลงตะกร้าก่อนเริ่ม Checkout</p>
        <Link className="button button-gold" href="/v2/shop">
          <Icon name="shop" />
          ไปที่ร้านค้า
        </Link>
      </div>
    );
  }

  if (stage === "complete") {
    return (
      <div className="prototype-success">
        <span>
          <Icon name="check" />
        </span>
        <small>DEMO FLOW COMPLETE</small>
        <h2>จบการทดลองชำระเงินแล้ว</h2>
        <p>
          ไม่มีเงินถูกเรียกเก็บ ไม่มีเลขคำสั่งซื้อถูกสร้าง
          และข้อมูลที่กรอกไม่ได้ถูกส่งออกจากอุปกรณ์นี้
        </p>
        <div>
          <strong>ยอดจำลอง {formatPrice(subtotal)}</strong>
          <span>{items.length} รายการ · QR Code จำลองเท่านั้น</span>
        </div>
        <button
          className="button button-ghost"
          type="button"
          onClick={() => {
            setStage("payment");
            setQrVisible(true);
          }}
        >
          <Icon name="arrow-left" />
          กลับไปดู QR จำลอง
        </button>
        <Link className="button button-gold" href="/v2/shop">
          <Icon name="shop" />
          กลับร้านค้า
        </Link>
      </div>
    );
  }

  if (stage === "payment") {
    return (
      <div className="checkout-layout payment-layout">
        <section className="checkout-card payment-prototype">
          <div className="checkout-stage-label">
            <span>2</span>
            <div>
              <small>PAYMENT METHOD</small>
              <h2>เลือกวิธีชำระเงิน</h2>
            </div>
          </div>

          <div className="notice">
            <Icon name="shield" />
            หน้านี้เป็นต้นแบบ ไม่มีการเชื่อมต่อธนาคารหรือ Payment Gateway
            และ QR ด้านล่างไม่สามารถใช้ชำระเงินจริงได้
          </div>

          <label className="payment-method-card active">
            <input type="radio" name="payment" checked readOnly />
            <span className="payment-method-icon">
              <Icon name="scan" />
            </span>
            <span>
              <strong>QR Code (จำลอง)</strong>
              <small>วิธีชำระเงินเดียวในต้นแบบนี้</small>
            </span>
            <Icon name="check" />
          </label>

          {!qrVisible ? (
            <div className="qr-placeholder">
              <span>
                <Icon name="scan" />
              </span>
              <h3>พร้อมสร้าง QR Code จำลอง</h3>
              <p>QR ที่แสดงจะเป็นเพียงภาพประกอบและไม่มีข้อมูลการชำระเงิน</p>
              <button
                className="button button-gold"
                type="button"
                onClick={() => setQrVisible(true)}
              >
                <Icon name="sparkle" />
                สร้าง QR Code (จำลอง)
              </button>
            </div>
          ) : (
            <div className="mock-qr-shell">
              <div className="mock-qr-heading">
                <span>QR PAYMENT DEMO</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div
                className="mock-qr"
                aria-label="QR Code จำลอง ไม่สามารถสแกนหรือชำระเงินได้"
              >
                {mockQrCells.map((active, index) => (
                  <i
                    className={active ? "mock-qr-cell active" : "mock-qr-cell"}
                    key={index}
                    aria-hidden="true"
                  />
                ))}
                <div className="mock-qr-demo" aria-hidden="true">
                  DEMO
                </div>
              </div>
              <strong className="mock-qr-warning">QR จำลอง · สแกนไม่ได้</strong>
              <p>ไม่มีเลขบัญชี ไม่มี PromptPay และไม่มีข้อมูลธุรกรรมอยู่ในภาพนี้</p>
            </div>
          )}

          <div className="payment-actions">
            <button
              className="button button-ghost"
              type="button"
              onClick={() => setStage("details")}
            >
              <Icon name="arrow-left" />
              แก้ไขที่อยู่
            </button>
            <button
              className="button button-gold"
              type="button"
              disabled={!qrVisible}
              onClick={() => setStage("complete")}
            >
              <Icon name="check" />
              ฉันชำระแล้ว (จำลอง)
            </button>
          </div>
        </section>

        <aside className="cart-summary payment-summary">
          <small>DELIVERY SUMMARY</small>
          <h2>ที่อยู่จัดส่ง</h2>
          <div className="address-preview">
            <strong>{draft.fullName}</strong>
            <span>{draft.phone}</span>
            <p>
              {draft.address}<br />
              {draft.province} {draft.postalCode}
            </p>
          </div>
          <div className="summary-total">
            <span>ยอดจำลอง</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <p className="checkout-disclaimer">
            ข้อมูลทั้งหมดอยู่ในหน้านี้ชั่วคราวและจะไม่ถูกส่งไปที่ใด
          </p>
        </aside>
      </div>
    );
  }

  return (
    <form className="checkout-layout" onSubmit={continueToPayment}>
      <section className="checkout-card">
        <div className="checkout-stage-label">
          <span>1</span>
          <div>
            <small>SHIPPING DETAILS</small>
            <h2>ข้อมูลสำหรับจัดส่ง</h2>
          </div>
        </div>
        <div className="notice">
          <Icon name="shield" />
          ต้นแบบนี้ใช้ข้อมูลในหน้าจอชั่วคราวเท่านั้น ไม่บันทึก
          และไม่ส่งข้อมูลส่วนตัวออกจากอุปกรณ์
        </div>
        <div className="checkout-fields">
          <div className="field">
            <label htmlFor="checkout-name">ชื่อ–นามสกุล</label>
            <input
              id="checkout-name"
              required
              autoComplete="name"
              value={draft.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              placeholder="ชื่อผู้รับ"
            />
          </div>
          <div className="field">
            <label htmlFor="checkout-phone">เบอร์โทร</label>
            <input
              id="checkout-phone"
              required
              inputMode="tel"
              autoComplete="tel"
              value={draft.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="08x-xxx-xxxx"
            />
          </div>
          <div className="field full-field">
            <label htmlFor="checkout-address">ที่อยู่</label>
            <textarea
              id="checkout-address"
              required
              autoComplete="street-address"
              value={draft.address}
              onChange={(event) => update("address", event.target.value)}
              placeholder="บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต"
            />
          </div>
          <div className="field">
            <label htmlFor="checkout-province">จังหวัด</label>
            <input
              id="checkout-province"
              required
              autoComplete="address-level1"
              value={draft.province}
              onChange={(event) => update("province", event.target.value)}
              placeholder="กรุงเทพมหานคร"
            />
          </div>
          <div className="field">
            <label htmlFor="checkout-postal">รหัสไปรษณีย์</label>
            <input
              id="checkout-postal"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]{5}"
              value={draft.postalCode}
              onChange={(event) => update("postalCode", event.target.value)}
              placeholder="10110"
            />
          </div>
          <div className="field full-field">
            <label htmlFor="checkout-note">หมายเหตุ (ถ้ามี)</label>
            <textarea
              id="checkout-note"
              value={draft.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="รายละเอียดเพิ่มเติมสำหรับการจัดส่ง"
            />
          </div>
        </div>
      </section>

      <aside className="cart-summary">
        <small>ORDER REVIEW</small>
        <h2>ตรวจสอบรายการ</h2>
        {items.map((item) => (
          <div className="checkout-line" key={item.key}>
            <img src={item.image} alt="" />
            <span>
              {item.name}
              <small>จำนวน {item.quantity}</small>
            </span>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </div>
        ))}
        <div className="summary-total">
          <span>ยอดจำลอง</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <button type="submit" className="button button-gold">
          ไปเลือกวิธีชำระเงิน
          <Icon name="arrow-right" />
        </button>
        <p className="checkout-disclaimer">
          ขั้นตอนถัดไปมีเฉพาะ QR Code (จำลอง) และไม่รับเงินจริง
        </p>
      </aside>
    </form>
  );
}
