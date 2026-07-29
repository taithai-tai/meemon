import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const baseDir = "/Users/taithai/Documents/GitHub/taithai_app/shopee_king_6914";
const threadId = "019fac05-c38a-7132-b675-1a676fb2f644";
const outputDir = `${baseDir}/outputs/${threadId}`;
const source = JSON.parse(await fs.readFile(`${baseDir}/products.json`, "utf8"));
const imageManifest = JSON.parse(await fs.readFile(`${baseDir}/image_manifest.json`, "utf8"));
const products = source.products;

await fs.mkdir(outputDir, { recursive: true });

function text(value) {
  return value == null ? "" : String(value);
}

function preview(value, maxLength = 280) {
  const cleaned = text(value).replace(/\s+/g, " ").trim();
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1)}…` : cleaned;
}

function variantSummary(product) {
  return (product.variants || [])
    .map((group) => `${group.name}: ${(group.options || []).map((option) => option.name).join(" | ")}`)
    .join("; ");
}

function optionCount(product) {
  return (product.variants || []).reduce((sum, group) => sum + (group.options || []).length, 0);
}

const productHeaders = [
  "ลำดับ",
  "Item ID",
  "ชื่อสินค้า",
  "ราคาปัจจุบันต่ำสุด (บาท)",
  "ราคาปัจจุบันสูงสุด (บาท)",
  "ราคาเดิมต่ำสุด (บาท)",
  "ราคาเดิมสูงสุด (บาท)",
  "ส่วนลด",
  "คะแนนสินค้า",
  "จำนวนรีวิว",
  "ขายแล้ว (ชิ้น)",
  "สต็อกที่แสดง",
  "หมวดหมู่",
  "ตัวเลือกสินค้า",
  "จำนวนตัวเลือก",
  "จำนวนรูป",
  "รายละเอียด (ย่อ)",
  "URL สินค้า",
  "โฟลเดอร์ข้อมูล/รูป",
  "วันเก็บข้อมูล",
];

const productRows = products.map((product, index) => [
  index + 1,
  text(product.item_id),
  text(product.name),
  product.price_normalized?.current_min_thb ?? null,
  product.price_normalized?.current_max_thb ?? null,
  product.price_normalized?.original_min_thb ?? null,
  product.price_normalized?.original_max_thb ?? null,
  text(product.discount),
  product.rating_value ?? null,
  product.review_count ?? null,
  product.sold_count_numeric ?? null,
  text(product.stock_text),
  (product.category_path || []).join(" > "),
  variantSummary(product),
  optionCount(product),
  (product.all_image_urls || []).length,
  preview(product.description),
  text(product.page_url || product.href),
  `products/${product.item_id}`,
  product.captured_at ? new Date(product.captured_at) : null,
]);

const variantHeaders = [
  "Item ID",
  "ชื่อสินค้า",
  "กลุ่มตัวเลือก",
  "ชื่อตัวเลือก",
  "ไม่พร้อมเลือก",
  "URL รูปตัวเลือก",
  "โฟลเดอร์สินค้า",
];
const variantRows = products.flatMap((product) =>
  (product.variants || []).flatMap((group) =>
    (group.options || []).map((option) => [
      text(product.item_id),
      text(product.name),
      text(group.name),
      text(option.name),
      Boolean(option.disabled),
      text(option.image_url),
      `products/${product.item_id}`,
    ]),
  ),
);

const specificationHeaders = ["Item ID", "ชื่อสินค้า", "หัวข้อ", "ค่า"];
const specificationRows = products.flatMap((product) =>
  (product.specifications || []).map((specification) => [
    text(product.item_id),
    text(product.name),
    text(specification.label),
    text(specification.value),
  ]),
);

const imageHeaders = ["Item ID", "ชื่อสินค้า", "ลำดับรูป", "URL รูปต้นฉบับ", "ไฟล์ในเครื่อง"];
const productNameById = new Map(products.map((product) => [text(product.item_id), text(product.name)]));
const imageRows = imageManifest.map((image) => [
  text(image.item_id),
  productNameById.get(text(image.item_id)) || text(image.name),
  image.image_index,
  text(image.url),
  text(image.suggested_path),
]);

const descriptionHeaders = ["Item ID", "ชื่อสินค้า", "รายละเอียดสินค้าเต็ม", "URL สินค้า"];
const descriptionRows = products.map((product) => [
  text(product.item_id),
  text(product.name),
  text(product.description),
  text(product.page_url || product.href),
]);

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Summary");
const productsSheet = workbook.worksheets.add("Products");
const variantsSheet = workbook.worksheets.add("Variants");
const specsSheet = workbook.worksheets.add("Specifications");
const imagesSheet = workbook.worksheets.add("Images");
const descriptionsSheet = workbook.worksheets.add("Descriptions");
const shopSheet = workbook.worksheets.add("Shop");

for (const sheet of [
  summary,
  productsSheet,
  variantsSheet,
  specsSheet,
  imagesSheet,
  descriptionsSheet,
  shopSheet,
]) {
  sheet.showGridLines = false;
}

summary.getRange("A1:F2").merge();
summary.getRange("A1").values = [["ข้อมูลสินค้าร้าน @kk64 บน Shopee"]];
summary.getRange("A1:F2").format = {
  fill: "#EE4D2D",
  font: { bold: true, color: "#FFFFFF", size: 20 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
summary.getRange("A4:A11").values = [
  ["จำนวนสินค้าที่หน้าร้านรายงาน"],
  ["จำนวนสินค้าที่เปิดดูได้"],
  ["จำนวนไฟล์รูปภาพ"],
  ["จำนวนตัวเลือกสินค้า"],
  ["คะแนนร้าน"],
  ["จำนวนการให้คะแนนร้าน"],
  ["วันที่เก็บข้อมูล"],
  ["แหล่งข้อมูล"],
];
summary.getRange("B4").values = [[source.shop.reported_product_count]];
summary.getRange("B5").formulas = [[`=COUNTA('Products'!$B$2:$B$${productRows.length + 1})`]];
summary.getRange("B6").formulas = [[`=COUNTA('Images'!$D$2:$D$${imageRows.length + 1})`]];
summary.getRange("B7").formulas = [[`=COUNTA('Variants'!$D$2:$D$${variantRows.length + 1})`]];
summary.getRange("B8").values = [[4.9]];
summary.getRange("B9").values = [[266]];
summary.getRange("B10").values = [[new Date(source.captured_at)]];
summary.getRange("B11:F11").merge();
summary.getRange("B11").values = [[source.shop.shop_url]];
summary.getRange("A4:A11").format = {
  fill: "#FFF2EE",
  font: { bold: true, color: "#8E2F1A" },
};
summary.getRange("A4:F11").format.borders = {
  preset: "inside",
  style: "thin",
  color: "#E7D6D0",
};
summary.getRange("B4:B9").format.numberFormat = "#,##0.0";
summary.getRange("B4:B7").format.numberFormat = "#,##0";
summary.getRange("B10").format.numberFormat = "yyyy-mm-dd hh:mm";
summary.getRange("A13:F15").merge();
summary.getRange("A13").values = [[
  "หมายเหตุ: โปรไฟล์ร้านแสดงสินค้ารวม 71 รายการ แต่หน้า “สินค้าทั้งหมด” เปิดเผยรายการที่เข้าถึงได้ 45 รายการ ณ วันที่เก็บข้อมูล จึงบันทึกรายละเอียดครบตามรายการที่เว็บไซต์เปิดให้ดู",
]];
summary.getRange("A13:F15").format = {
  fill: "#FFF9E6",
  font: { color: "#6B4F00" },
  wrapText: true,
  verticalAlignment: "top",
};
summary.getRange("A1:F15").format.rowHeight = 24;
summary.getRange("A13:F15").format.rowHeight = 34;
summary.getRange("A1:A15").format.columnWidth = 28;
summary.getRange("B1:F15").format.columnWidth = 18;

productsSheet.getRangeByIndexes(0, 0, 1, productHeaders.length).values = [productHeaders];
productsSheet.getRangeByIndexes(1, 0, productRows.length, productHeaders.length).values = productRows;
productsSheet.tables.add(`A1:T${productRows.length + 1}`, true, "ProductsTable").style = "TableStyleMedium2";
productsSheet.freezePanes.freezeRows(1);
productsSheet.freezePanes.freezeColumns(2);
productsSheet.getRange(`A1:T${productRows.length + 1}`).format.verticalAlignment = "top";
productsSheet.getRange(`C2:C${productRows.length + 1}`).format.wrapText = true;
productsSheet.getRange(`L2:Q${productRows.length + 1}`).format.wrapText = true;
productsSheet.getRange(`D2:G${productRows.length + 1}`).format.numberFormat = "฿#,##0";
productsSheet.getRange(`I2:I${productRows.length + 1}`).format.numberFormat = "0.0";
productsSheet.getRange(`J2:K${productRows.length + 1}`).format.numberFormat = "#,##0";
productsSheet.getRange(`O2:P${productRows.length + 1}`).format.numberFormat = "#,##0";
productsSheet.getRange(`T2:T${productRows.length + 1}`).format.numberFormat = "yyyy-mm-dd hh:mm";
productsSheet.getRange(`A2:T${productRows.length + 1}`).format.rowHeight = 50;
const productWidths = [7, 16, 42, 16, 16, 16, 16, 10, 12, 12, 12, 24, 34, 45, 12, 10, 48, 42, 25, 20];
productWidths.forEach((width, index) => {
  productsSheet.getRangeByIndexes(0, index, productRows.length + 1, 1).format.columnWidth = width;
});

variantsSheet.getRangeByIndexes(0, 0, 1, variantHeaders.length).values = [variantHeaders];
if (variantRows.length) variantsSheet.getRangeByIndexes(1, 0, variantRows.length, variantHeaders.length).values = variantRows;
variantsSheet.tables.add(`A1:G${variantRows.length + 1}`, true, "VariantsTable").style = "TableStyleMedium2";
variantsSheet.freezePanes.freezeRows(1);
variantsSheet.getRange(`A1:G${variantRows.length + 1}`).format.verticalAlignment = "top";
variantsSheet.getRange(`B2:D${variantRows.length + 1}`).format.wrapText = true;
[16, 42, 18, 34, 14, 55, 24].forEach((width, index) => {
  variantsSheet.getRangeByIndexes(0, index, variantRows.length + 1, 1).format.columnWidth = width;
});

specsSheet.getRangeByIndexes(0, 0, 1, specificationHeaders.length).values = [specificationHeaders];
if (specificationRows.length) specsSheet.getRangeByIndexes(1, 0, specificationRows.length, specificationHeaders.length).values = specificationRows;
specsSheet.tables.add(`A1:D${specificationRows.length + 1}`, true, "SpecificationsTable").style = "TableStyleMedium2";
specsSheet.freezePanes.freezeRows(1);
specsSheet.getRange(`B2:D${specificationRows.length + 1}`).format.wrapText = true;
[16, 42, 24, 55].forEach((width, index) => {
  specsSheet.getRangeByIndexes(0, index, specificationRows.length + 1, 1).format.columnWidth = width;
});

imagesSheet.getRangeByIndexes(0, 0, 1, imageHeaders.length).values = [imageHeaders];
imagesSheet.getRangeByIndexes(1, 0, imageRows.length, imageHeaders.length).values = imageRows;
imagesSheet.tables.add(`A1:E${imageRows.length + 1}`, true, "ImagesTable").style = "TableStyleMedium2";
imagesSheet.freezePanes.freezeRows(1);
imagesSheet.getRange(`B2:E${imageRows.length + 1}`).format.wrapText = true;
[16, 42, 10, 65, 40].forEach((width, index) => {
  imagesSheet.getRangeByIndexes(0, index, imageRows.length + 1, 1).format.columnWidth = width;
});

descriptionsSheet.getRangeByIndexes(0, 0, 1, descriptionHeaders.length).values = [descriptionHeaders];
descriptionsSheet.getRangeByIndexes(1, 0, descriptionRows.length, descriptionHeaders.length).values = descriptionRows;
descriptionsSheet.tables.add(`A1:D${descriptionRows.length + 1}`, true, "DescriptionsTable").style = "TableStyleMedium2";
descriptionsSheet.freezePanes.freezeRows(1);
descriptionsSheet.getRange(`B2:D${descriptionRows.length + 1}`).format.wrapText = true;
descriptionsSheet.getRange(`A2:D${descriptionRows.length + 1}`).format.verticalAlignment = "top";
descriptionsSheet.getRange(`A2:D${descriptionRows.length + 1}`).format.rowHeight = 110;
[16, 42, 90, 50].forEach((width, index) => {
  descriptionsSheet.getRangeByIndexes(0, index, descriptionRows.length + 1, 1).format.columnWidth = width;
});

shopSheet.getRange("A1:B14").values = [
  ["ฟิลด์", "ค่า"],
  ["Shop ID", source.shop.shop_id],
  ["ชื่อผู้ใช้", source.shop.username],
  ["ชื่อที่แสดง", source.shop.display_name],
  ["URL ร้าน", source.shop.shop_url],
  ["จำนวนสินค้าที่รายงาน", source.shop.reported_product_count],
  ["จำนวนสินค้าที่เปิดดูได้", source.shop.active_products_exposed],
  ["คะแนนร้าน", 4.9],
  ["จำนวนการให้คะแนน", 266],
  ["ผู้ติดตาม", "1k"],
  ["กำลังติดตาม", 19],
  ["ประสิทธิภาพการแชท", "43%"],
  ["เข้าร่วมเมื่อ", "9 ปี ที่ผ่านมา"],
  ["เลขทะเบียนนิติบุคคล", 383562000224],
];
shopSheet.tables.add("A1:B14", true, "ShopTable").style = "TableStyleMedium2";
shopSheet.getRange("A1:A14").format.columnWidth = 30;
shopSheet.getRange("B1:B14").format.columnWidth = 55;
shopSheet.getRange("A1:B14").format.wrapText = true;
shopSheet.getRange("B14").format.numberFormat = "0000000000000";

const csvRows = [productHeaders, ...productRows.map((row) =>
  row.map((value) => value instanceof Date ? value.toISOString() : value)
)];
const csvText = csvRows
  .map((row) =>
    row.map((value) => {
      const rendered = value == null ? "" : String(value);
      return `"${rendered.replaceAll('"', '""')}"`;
    }).join(","),
  )
  .join("\n");
await fs.writeFile(`${baseDir}/products.csv`, `\uFEFF${csvText}`, "utf8");

const productsCheck = await workbook.inspect({
  kind: "table",
  range: `Products!A1:T6`,
  include: "values,formulas",
  tableMaxRows: 6,
  tableMaxCols: 20,
});
console.log(productsCheck.ndjson);

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(formulaErrors.ndjson);

for (const [sheetName, range] of [
  ["Summary", "A1:F15"],
  ["Products", "A1:T12"],
  ["Variants", "A1:G15"],
  ["Specifications", "A1:D15"],
  ["Images", "A1:E15"],
  ["Descriptions", "A1:D8"],
  ["Shop", "A1:B14"],
]) {
  const previewBlob = await workbook.render({
    sheetName,
    range,
    scale: 1,
    format: "png",
  });
  await fs.writeFile(
    `${outputDir}/preview_${sheetName.toLowerCase()}.png`,
    new Uint8Array(await previewBlob.arrayBuffer()),
  );
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(`${outputDir}/shopee_king_6914_products.xlsx`);

console.log(JSON.stringify({
  workbook: `${outputDir}/shopee_king_6914_products.xlsx`,
  csv: `${baseDir}/products.csv`,
  products: productRows.length,
  variants: variantRows.length,
  specifications: specificationRows.length,
  images: imageRows.length,
}));
