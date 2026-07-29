import fs from "node:fs/promises";

const baseDir = "/Users/taithai/Documents/GitHub/taithai_app/shopee_king_6914";
const filePath = `${baseDir}/products.json`;
const source = JSON.parse(await fs.readFile(filePath, "utf8"));

for (const product of source.products) {
  const structuredProduct = (product.structured_data || []).find(
    (entry) => entry?.["@type"] === "Product",
  );
  const offer = structuredProduct?.offers || {};

  if (!product.description && structuredProduct?.description) {
    product.description = structuredProduct.description;
    product.description_source = "structured_data";
  } else if (product.description) {
    product.description_source = "page_dom";
  }

  product.brand = structuredProduct?.brand || null;
  product.availability = offer.availability?.split("/").pop() || null;
  product.item_condition = offer.itemCondition || null;
  product.structured_price_thb =
    offer.price == null || offer.price === "" ? null : Number(offer.price);
  product.price_currency = offer.priceCurrency || "THB";

  const existing = new Map(
    (product.specifications || []).map((entry) => [entry.label, entry.value]),
  );
  const additions = [
    ["รหัสสินค้า", product.item_id],
    ["หมวดหมู่", (product.category_path || []).join(" > ")],
    ["สถานะสินค้า", product.availability],
    ["สภาพสินค้า", product.item_condition],
    ["ผู้ขาย", offer.seller?.name || "@kk64"],
    [
      "ราคาใน Structured Data",
      product.structured_price_thb == null
        ? null
        : `${product.structured_price_thb} ${product.price_currency}`,
    ],
  ];
  for (const [label, value] of additions) {
    if (value && !existing.has(label)) existing.set(label, String(value));
  }
  product.specifications = Array.from(existing, ([label, value]) => ({ label, value }));

  const structuredImage = structuredProduct?.image;
  product.all_image_urls = Array.from(
    new Set([...(product.all_image_urls || []), structuredImage].filter(Boolean)),
  );

  const productDir = `${baseDir}/products/${product.item_id}`;
  await fs.mkdir(productDir, { recursive: true });
  await fs.writeFile(`${productDir}/data.json`, JSON.stringify(product, null, 2), "utf8");
}

source.repaired_at = new Date().toISOString();
await fs.writeFile(filePath, JSON.stringify(source, null, 2), "utf8");

console.log(
  JSON.stringify({
    products: source.products.length,
    descriptions: source.products.filter((product) => product.description).length,
    specifications: source.products.reduce(
      (sum, product) => sum + (product.specifications || []).length,
      0,
    ),
  }),
);
