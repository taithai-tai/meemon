import assert from "node:assert/strict";
import test from "node:test";
import { formatNewOrderLineBroadcast } from "../../../supabase/functions/_shared/line-order.ts";

test("LINE broadcast contains the complete new-order and customer details", () => {
  const message = formatNewOrderLineBroadcast({
    id: "e599080b-b6ba-4fb6-8ba7-5f68cf9d67d3",
    order_number: "MM20260802-001234",
    status: "pending_payment",
    full_name: "ลูกค้า ทดสอบ",
    phone: "0812345678",
    address: "99/9 หมู่ 1",
    province: "บึงกาฬ",
    postal_code: "38000",
    note: "โทรก่อนส่ง",
    subtotal_satang: 25950,
    shipping_satang: 0,
    total_satang: 25950,
    created_at: "2026-08-02T12:00:00.000Z",
    order_items: [{
      product_name: "กำไลมีมนต์",
      sku_label: "สีม่วง",
      unit_price_satang: 12975,
      quantity: 2,
      line_total_satang: 25950,
    }],
  });

  assert.match(message, /MM20260802-001234/);
  assert.match(message, /ลูกค้า ทดสอบ/);
  assert.match(message, /0812345678/);
  assert.match(message, /99\/9 หมู่ 1 บึงกาฬ 38000/);
  assert.match(message, /โทรก่อนส่ง/);
  assert.match(message, /กำไลมีมนต์ \(สีม่วง\) × 2/);
  assert.match(message, /259\.50/);
  assert.match(message, /https:\/\/www\.meemon\.net\/v2\/admin\//);
});

test("LINE broadcast normalizes a one-to-one embedded order item", () => {
  const message = formatNewOrderLineBroadcast({
    id: "45d49f61-73df-4c33-a44f-051080ce7e80",
    order_number: "MM20260802-001235",
    total_satang: 9900,
    order_items: {
      product_name: "วอลเปเปอร์",
      unit_price_satang: 9900,
      quantity: 1,
      line_total_satang: 9900,
    },
  });
  assert.match(message, /วอลเปเปอร์ × 1/);
  assert.match(message, /99\.00/);
});
