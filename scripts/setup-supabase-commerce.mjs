import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildCatalogSeed } from "./lib/catalog-seed.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !bootstrapPassword) {
  throw new Error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_BOOTSTRAP_PASSWORD before running setup.");
}

const headers = {
  apikey: serviceRoleKey,
  authorization: `Bearer ${serviceRoleKey}`,
  "content-type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  if (!response.ok) throw new Error(`${path} failed (${response.status}): ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

async function upsert(table, rows, conflict) {
  for (let index = 0; index < rows.length; index += 100) {
    await request(`/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
      method: "POST",
      // Deployment is repeatable, but the live database remains the source of
      // truth. Never overwrite prices, stock, visibility, or images that an
      // administrator has changed after the first import.
      headers: { prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify(rows.slice(index, index + 100)),
    });
  }
}

const products = JSON.parse(await readFile(resolve(repositoryRoot, "v2/_source/data/products.json"), "utf8"));
const seed = buildCatalogSeed(products);
await upsert("products", seed.productRows, "id");
await upsert("product_images", seed.imageRows, "product_id,position");
await upsert("product_option_groups", seed.groupRows, "id");
await upsert("product_options", seed.optionRows, "id");
await upsert("product_skus", seed.skuRows, "product_id,selection_key");

const adminEmail = "admin@admin.meemon.net";
let userId;
const users = await request("/auth/v1/admin/users?page=1&per_page=1000");
userId = users.users?.find((user) => user.email === adminEmail)?.id;
if (!userId) {
  const created = await request("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email: adminEmail, password: bootstrapPassword, email_confirm: true }),
  });
  userId = created.id;
} else {
  await request(`/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ password: bootstrapPassword }),
  });
}
await request("/rest/v1/admin_profiles?on_conflict=user_id", {
  method: "POST",
  headers: { prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify({ user_id: userId, username: "admin", active: true, must_rotate_password: false }),
});

process.stdout.write(`Supabase commerce setup complete: ${seed.productRows.length} products, ${seed.skuRows.length} SKUs, and admin profile ready.\n`);
