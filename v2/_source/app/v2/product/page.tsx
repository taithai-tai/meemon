import { Suspense } from "react";
import { LiveProductClient } from "../../components/LiveProductClient";
import { BackLink } from "../../components/PageElements";

export const metadata = { title: "รายละเอียดสินค้า" };

export default function Page() {
  return <section className="content-section"><BackLink href="/v2/shop" label="กลับร้านค้า" /><Suspense fallback={<div className="empty-state">กำลังโหลด…</div>}><LiveProductClient /></Suspense></section>;
}

