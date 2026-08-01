import { PaymentSuccessClient } from "../../components/PaymentSuccessClient";

export const metadata = {
  title: "ชำระเงินสำเร็จ · Meemon",
  description: "EasySlip ตรวจสอบการโอนเงินสำเร็จแล้ว",
};

export default function PaymentSuccessPage() {
  return <section className="content-section payment-success-section"><PaymentSuccessClient /></section>;
}
