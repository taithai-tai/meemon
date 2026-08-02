import type { SupabaseClient } from "npm:@supabase/supabase-js@2.57.4";

interface LineOrderItem {
  product_name?: string | null;
  sku_label?: string | null;
  unit_price_satang?: number | null;
  quantity?: number | null;
  line_total_satang?: number | null;
  selections?: unknown;
}

export interface LineOrderNotification {
  id: string;
  order_number?: string | null;
  status?: string | null;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  province?: string | null;
  postal_code?: string | null;
  note?: string | null;
  subtotal_satang?: number | null;
  shipping_satang?: number | null;
  total_satang?: number | null;
  created_at?: string | null;
  order_items?: LineOrderItem[] | LineOrderItem | null;
}

const LINE_BROADCAST_ENDPOINT = "https://api.line.me/v2/bot/message/broadcast";
const DEFAULT_ADMIN_URL = "https://www.meemon.net/v2/admin/";

function money(satang: number | null | undefined) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(satang ?? 0) / 100);
}

function rows<T>(value: T[] | T | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function createdAt(value: string | null | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function formatNewOrderLineBroadcast(
  order: LineOrderNotification,
  adminUrl = DEFAULT_ADMIN_URL,
) {
  const itemLines = rows(order.order_items).map((item, index) => {
    const variant = String(item.sku_label ?? "").trim();
    const name = String(item.product_name ?? "สินค้า").trim();
    const quantity = Number(item.quantity ?? 0);
    return `${index + 1}. ${name}${variant ? ` (${variant})` : ""} × ${quantity}\n` +
      `   ฿${money(item.unit_price_satang)} × ${quantity} = ฿${money(item.line_total_satang)}`;
  });
  const note = String(order.note ?? "").trim() || "-";
  const address = [order.address, order.province, order.postal_code]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const header = [
    "🔔 มีออเดอร์ใหม่ Meemon",
    `เลขออเดอร์: ${order.order_number ?? "-"}`,
    `เวลา: ${createdAt(order.created_at)}`,
    `สถานะ: ${order.status ?? "pending_payment"}`,
    "",
    "👤 ข้อมูลลูกค้า",
    `ชื่อ: ${order.full_name ?? "-"}`,
    `โทร: ${order.phone ?? "-"}`,
    `ที่อยู่: ${address || "-"}`,
    `หมายเหตุ: ${note}`,
    "",
    "🛍️ รายการสินค้า",
    ...(itemLines.length ? itemLines : ["- ไม่พบรายการสินค้า"]),
    "",
    `รวมสินค้า: ฿${money(order.subtotal_satang)}`,
    `ค่าจัดส่ง: ฿${money(order.shipping_satang)}`,
    `ยอดรวม: ฿${money(order.total_satang)}`,
  ].join("\n");
  const footer = `\n\nเปิดหลังบ้าน: ${adminUrl}`;

  // LINE text messages support at most 5,000 characters. Keep the customer
  // identity, order number, totals, and admin link even for unusually long carts.
  if (header.length + footer.length <= 4900) return header + footer;
  return `${header.slice(0, 4650)}\n…รายการยาวเกินไป กรุณาเปิดดูในหลังบ้าน${footer}`;
}

export async function broadcastLineNewOrder(
  client: SupabaseClient,
  orderId: string,
) {
  const channelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN")?.trim();
  if (!channelAccessToken) {
    console.warn("LINE order broadcast is disabled because LINE_CHANNEL_ACCESS_TOKEN is not configured");
    return { sent: false, reason: "not_configured" } as const;
  }

  const { data, error } = await client
    .from("orders")
    .select(`
      id, order_number, status, full_name, phone, address, province, postal_code,
      note, subtotal_satang, shipping_satang, total_satang, created_at,
      order_items(product_name, sku_label, unit_price_satang, quantity, line_total_satang, selections)
    `)
    .eq("id", orderId)
    .single();
  if (error || !data) throw new Error("New order could not be loaded for LINE broadcast");

  const order = data as unknown as LineOrderNotification;
  const adminUrl = Deno.env.get("LINE_ADMIN_ORDER_URL")?.trim() || DEFAULT_ADMIN_URL;
  const response = await fetch(LINE_BROADCAST_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${channelAccessToken}`,
      "content-type": "application/json",
      "x-line-retry-key": order.id,
    },
    body: JSON.stringify({
      messages: [{ type: "text", text: formatNewOrderLineBroadcast(order, adminUrl) }],
      notificationDisabled: false,
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`LINE broadcast failed with HTTP ${response.status}: ${detail}`);
  }
  return { sent: true } as const;
}
