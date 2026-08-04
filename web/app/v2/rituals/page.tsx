import { ModuleGrid, PageHero } from "../../components/PageElements";
import { ritualModules } from "@/lib/data";

export const metadata = { title: "พิธีมงคล" };

export default function RitualsPage() {
  return (
    <>
      <PageHero
        eyebrow="RITUAL LIBRARY"
        title="พิธีเล็ก ๆ เพื่อเริ่มสิ่งใหม่ด้วยใจมั่นคง"
        description="คู่มือ ฤกษ์ และบทคาถาของ Meemon ถูกจัดใหม่ให้สงบ อ่านง่าย และทำตามได้ทีละขั้น"
      />
      <section className="content-section">
        <ModuleGrid modules={ritualModules} />
      </section>
    </>
  );
}
