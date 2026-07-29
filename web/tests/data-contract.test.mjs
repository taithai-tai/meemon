import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const content = JSON.parse(await readFile(new URL("../data/legacy-content.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await readFile(new URL("../../legacy-routes.json", import.meta.url), "utf8"));

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else result.push(path);
  }
  return result;
}

test("catalog and content counts match the migration contract", async () => {
  assert.equal(products.length, 45);
  assert.equal(products.reduce((sum, product) => sum + product.variants.reduce((inner, group) => inner + group.options.length, 0), 0), 212);
  const productImages = await walk(fileURLToPath(new URL("../public/v2/assets/products/", import.meta.url)));
  assert.equal(productImages.filter((path) => path.endsWith(".webp")).length, 355);
  assert.equal(content.tarotCards.length, 78);
  assert.equal(content.fortunes.length, 24);
  assert.equal(content.chants.length, 3);
  assert.equal(content.wallpapers.days.length, 8);
});

test("every preserved HTML file matches its immutable hash after staging", async () => {
  assert.equal(manifest.routes.length, 96);
  for (const route of manifest.routes.filter((item) => !item.replacedByHome)) {
    const source = await readFile(new URL(`../../${route.path}`, import.meta.url));
    const staged = await readFile(new URL(`../public/${route.path}`, import.meta.url));
    assert.equal(createHash("sha256").update(source).digest("hex"), route.sha256, route.path);
    assert.deepEqual(staged, source, route.path);
  }
});

test("v2 state and service worker stay inside the v2 namespace", async () => {
  const provider = await readFile(new URL("../app/components/CartProvider.tsx", import.meta.url), "utf8");
  const register = await readFile(new URL("../app/components/PwaRegister.tsx", import.meta.url), "utf8");
  const worker = await readFile(new URL("../public/v2/sw.js", import.meta.url), "utf8");
  assert.match(provider, /meemon:v2:cart/);
  assert.doesNotMatch(provider, /(?<!meemon:v2:)localStorage\.(?:removeItem|clear)/);
  assert.match(register, /scope:\s*"\/v2\/"/);
  assert.match(worker, /!url\.pathname\.startsWith\("\/v2\/"\)/);
});
