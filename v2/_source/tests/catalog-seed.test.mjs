import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { buildCatalogSeed } from "../../../scripts/lib/catalog-seed.mjs";

const products = JSON.parse(await readFile(resolve(import.meta.dirname, "../data/products.json"), "utf8"));

test("catalog seed retains all products and creates selectable SKUs", () => {
  const seed = buildCatalogSeed(products);
  assert.equal(seed.productRows.length, 45);
  assert.ok(seed.skuRows.length >= 45);
  assert.ok(seed.productRows.every((product) => product.track_inventory === false));
  assert.ok(seed.skuRows.every((sku) => sku.selection_key === [...sku.option_ids].sort().join("|")));
});

test("range products remain visible but are not purchasable before SKU pricing", () => {
  const seed = buildCatalogSeed(products);
  const rangedIds = new Set(seed.productRows.filter((product) => product.price_min_satang !== product.price_max_satang).map((product) => product.id));
  assert.equal(rangedIds.size, 11);
  assert.ok(seed.productRows.filter((product) => rangedIds.has(product.id)).every((product) => product.status === "needs_pricing"));
  assert.ok(seed.skuRows.filter((sku) => rangedIds.has(sku.product_id)).every((sku) => sku.price_satang === null));
});

