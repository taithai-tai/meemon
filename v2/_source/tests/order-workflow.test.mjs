import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile("../../supabase/migrations/20260801000900_order_admin_and_phone_history.sql", "utf8");
const lookupStart = migration.indexOf("create or replace function public.lookup_orders_by_phone_v1");
const lookupBody = migration.slice(lookupStart);
const adminUi = await readFile("app/components/AdminClient.tsx", "utf8");
const globalCss = await readFile("app/globals.css", "utf8");

test("phone history exposes order items and status without shipping details", () => {
  assert.ok(lookupStart >= 0);
  assert.match(lookupBody, /'status', o\.status/);
  assert.match(lookupBody, /'name', i\.product_name/);
  assert.doesNotMatch(lookupBody, /o\.full_name|o\.address|o\.postal_code|payment_account_snapshot/);
});

test("admin print and fulfillment controls stay in the static UI contract", () => {
  assert.match(adminUi, /พิมพ์ออเดอร์/);
  assert.match(adminUi, /<option value="packing">กำลังแพ็ค<\/option>/);
  assert.match(adminUi, /<option value="shipped">จัดส่งแล้ว<\/option>/);
  assert.match(adminUi, /method: "DELETE"/);
  assert.match(adminUi, /\/v2\/assets\/brand\/logo\.png/);
  assert.match(globalCss, /@page \{ size: A4 portrait; margin: 8mm; \}/);
  assert.match(globalCss, /body\.printing-order > \*:not\(\.active-order-print\)/);
});
