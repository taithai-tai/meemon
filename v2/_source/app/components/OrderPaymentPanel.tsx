"use client";

import { useState } from "react";
import { turnstileSiteKey, uploadSlip } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import { updateSavedOrderStatus } from "@/lib/pending-orders";
import type { OrderStatus, PaymentAccountSnapshot } from "@/lib/types";
import { Icon } from "./Icons";
import { TurnstileWidget } from "./TurnstileWidget";

export interface PayableOrder {
  token: string;
  orderNumber: string;
  totalSatang: number;
  expiresAt: string;
  paymentAccount: PaymentAccountSnapshot;
  status?: OrderStatus;
}

export function OrderPaymentPanel({ order, onStatus }: { order: PayableOrder; onStatus?: (status: OrderStatus) => void }) {
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [slip, setSlip] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  async function submitSlip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!slip || !captchaToken) return setError("กรุณาเลือกไฟล์สลิปและยืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ");
    setBusy(true);
    try {
      const result = await uploadSlip(order.token, slip, captchaToken);
      const status = result.status as OrderStatus;
      if (status) {
        updateSavedOrderStatus(order.token, status);
        onStatus?.(status);
      }
      if (status === "paid") {
        window.location.assign(`/v2/payment-success/?token=${encodeURIComponent(order.token)}`);
        return;
      }
      setError("ระบบรับสลิปแล้วและส่งให้ร้านค้าตรวจสอบเพิ่มเติม");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ตรวจสลิปไม่สำเร็จ");
    } finally {
      setBusy(false);
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  return <section className="checkout-card payment-prototype order-payment-panel">
    <div className="checkout-stage-label"><span>2</span><div><small>BANK TRANSFER</small><h2>โอนเงินและอัปโหลดสลิป</h2></div></div>
    <div className="order-reference"><span>เลขออเดอร์</span><div className="order-number-copy"><strong>{order.orderNumber}</strong><button type="button" onClick={() => copy(order.orderNumber, "เลขออเดอร์")}>{copied === "เลขออเดอร์" ? "คัดลอกแล้ว" : "คัดลอก"}</button></div><span>เวลาโอน</span><strong className="payment-no-expiry">ไม่จำกัดเวลา</strong></div>
    <div className="bank-transfer-card">
      <span className="payment-method-icon"><Icon name="shield" /></span>
      <div><small>บัญชีรับเงิน</small><h3>{order.paymentAccount.bankName}</h3></div>
      <div className="bank-copy-row"><span><small>ชื่อบัญชี</small><strong>{order.paymentAccount.accountHolder}</strong></span><button type="button" onClick={() => copy(order.paymentAccount.accountHolder, "ชื่อบัญชี")}>{copied === "ชื่อบัญชี" ? "คัดลอกแล้ว" : "คัดลอก"}</button></div>
      <div className="bank-copy-row"><span><small>เลขบัญชี</small><strong className="account-number">{order.paymentAccount.accountNumber}</strong></span><button type="button" onClick={() => copy(order.paymentAccount.accountNumber, "เลขบัญชี")}>{copied === "เลขบัญชี" ? "คัดลอกแล้ว" : "คัดลอก"}</button></div>
      <div className="transfer-total"><span>ยอดที่ต้องโอนให้ตรง</span><strong>{formatPrice(order.totalSatang / 100)}</strong></div>
    </div>
    <div className="notice"><Icon name="info" />โอนเมื่อสะดวกได้โดยไม่มีเวลาหมดอายุ กรุณาโอนครั้งเดียวเต็มจำนวน แล้วอัปโหลดสลิปเพื่อให้ระบบตรวจยอด ผู้รับ และสลิปซ้ำอัตโนมัติ</div>
    <form className="slip-form" onSubmit={submitSlip}>
      <label className="slip-drop"><Icon name="scan" /><strong>{slip ? slip.name : "เลือกภาพสลิป"}</strong><small>JPG, PNG หรือ WebP ไม่เกิน 5 MB · สูงสุด 5 ครั้ง</small><input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setSlip(event.target.files?.[0] ?? null)} /></label>
      <TurnstileWidget siteKey={turnstileSiteKey} resetKey={captchaReset} onToken={setCaptchaToken} />
      {error ? <div className="form-error">{error}</div> : null}
      <button className="button button-gold" type="submit" disabled={busy || !slip || !captchaToken}>{busy ? "กำลังตรวจสอบ…" : "อัปโหลดและตรวจสลิป"}<Icon name="arrow-right" /></button>
    </form>
  </section>;
}
