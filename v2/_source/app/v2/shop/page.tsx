import { PageHero } from "../../components/PageElements";
import { ShopClient } from "../../components/ShopClient";
import { products } from "@/lib/data";

export const metadata = { title: "ร้านค้า" };

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="MEEMON SHOP"
        title="คอลเลกชันที่คัดสรรจากความเชื่อ"
        description="สินค้าจริงจากร้าน Meemon ทั้ง 45 รายการ จัดหมวดหมู่ใหม่ให้ค้นหาและเลือกชมได้ง่ายกว่าเดิม"
      />
      <section className="content-section">
        <ShopClient products={products} />
      </section>
    </>
  );
}
