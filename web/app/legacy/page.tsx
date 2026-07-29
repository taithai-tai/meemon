import manifest from "@/data/legacy-routes.json";
import { PageHero } from "../components/PageElements";

type LegacyRoute = (typeof manifest.routes)[number];

const hiddenPattern = /(?:^|[\/ _-])(test|beta|token|old|notindex)(?:[\/ _.-]|$)|\bv\d+(?:\.\d+)*\b/i;

const labels: Record<string, string> = {
  app: "Meemon App เดิม",
  shop: "ร้านค้าเดิม",
  tarot: "ไพ่ทาโรต์เดิม",
  wallpapers: "วอลเปเปอร์เดิม",
  pony: "คาถาอัศวินพาหนะ",
  openday: "ฤกษ์เปิดกระเป๋าเดิม",
  "How to": "คู่มือเดิม",
};

function titleFor(route: LegacyRoute) {
  const path = route.path.replace(/\/index\.html$/i, "").replace(/\.html$/i, "");
  return path.split("/").at(-1)?.replaceAll("-", " ").replaceAll("_", " ") || path;
}

export const metadata = { title: "คลังแอปเดิม" };

export default function LegacyPage() {
  const visible = manifest.routes.filter(
    (route) => !route.replacedByHome && !hiddenPattern.test(route.path),
  );
  const groups = visible.reduce<Record<string, LegacyRoute[]>>((result, route) => {
    const group = route.path.split("/")[0] || "อื่น ๆ";
    (result[group] ??= []).push(route);
    return result;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="LEGACY ARCHIVE"
        title="คลังแอป Meemon เวอร์ชันเดิม"
        description={`หน้าเดิมทุกไฟล์ยังอยู่ที่ URL เดิม พร้อมหน้าตา ตรรกะ และข้อมูลในอุปกรณ์แบบเดิมทั้งหมด คลังนี้แสดงเฉพาะทางเข้าหลักจากทั้งหมด ${manifest.totals.preservedHtmlPaths} เส้นทาง`}
      />
      <section className="content-section">
        <div className="notice legacy-notice">
          แอปในคลังนี้เปิดตรงจากต้นฉบับเดิม ไม่มี CSS หรือ JavaScript จาก Meemon V2 ถูกโหลดเข้าไป
        </div>
        <div className="legacy-grid">
          {Object.entries(groups).map(([group, routes]) => (
            <section className="legacy-group" key={group}>
              <small>{labels[group] ?? group}</small>
              <h2>{group}</h2>
              <div>
                {routes.map((route) => (
                  <a href={route.directoryUrl ?? route.fileUrl} key={route.path}>
                    <span>{titleFor(route)}</span><b>เปิดเวอร์ชันเดิม ↗</b>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
