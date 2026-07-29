import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const products = JSON.parse(
  readFileSync(new URL("../data/products.json", import.meta.url), "utf8"),
);
const content = JSON.parse(
  readFileSync(new URL("../data/legacy-content.json", import.meta.url), "utf8"),
);

test("keeps the imported Meemon catalog complete", () => {
  assert.equal(products.length, 45);
  assert.equal(
    products.reduce(
      (total, product) =>
        total +
        product.variants.reduce(
          (variantTotal, variant) =>
            variantTotal + (variant.options?.length ?? 0),
          0,
        ),
      0,
    ),
    212,
  );
});

test("keeps the migrated fortune content complete", () => {
  assert.equal(content.tarotCards.length, 78);
  assert.equal(content.fortunes.length, 24);
});
