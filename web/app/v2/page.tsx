import Link from "next/link";
import { ModuleGrid, PageHero } from "../components/PageElements";
import { fortuneModules, ritualModules } from "@/lib/data";

export const metadata = { title: "Meemon V2" };

export default function V2Home() {
  return (
    <>
      <PageHero
        eyebrow="MEEMON V2"
        title="พื้นที่ใหม่ของทุกความเชื่อ"
        description="เลือกสำรวจร้านค้า คำทำนาย พิธีมงคล และวอลเปเปอร์ในระบบใหม่ โดยแอปเดิมทุกหน้ายังคงเข้าได้จาก URL เดิม"
        actions={<Link href="/" className="button button-gold">กลับหน้า Meemon Home</Link>}
      />
      <section className="content-section">
        <ModuleGrid modules={[...fortuneModules.slice(0, 3), ...ritualModules.slice(0, 3)]} />
      </section>
    </>
  );
}
