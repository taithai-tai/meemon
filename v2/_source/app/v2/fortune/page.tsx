import { ModuleGrid, PageHero } from "../../components/PageElements";
import { fortuneModules } from "@/lib/data";

export const metadata = { title: "ดูดวงและคำทำนาย" };

export default function FortunePage() {
  return (
    <>
      <PageHero
        eyebrow="FORTUNE STUDIO"
        title="ฟังคำตอบ จากจังหวะภายใน"
        description="รวมเครื่องมือคำทำนายหลักของ Meemon ไว้ในประสบการณ์เดียว เลือกศาสตร์ที่ตรงกับคำถามของคุณในวันนี้"
      />
      <section className="content-section">
        <ModuleGrid modules={fortuneModules} />
      </section>
    </>
  );
}
