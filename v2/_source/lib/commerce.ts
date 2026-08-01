import type { CartItem, CheckoutDraft, Product, PublicOrder } from "./types";

// These three values are public browser configuration, not backend secrets.
// Keeping production defaults here makes both GitHub Pages and local testing
// work immediately, while environment variables can still override them.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL
  ?? "https://jfbfsarmyzvgtvwqapkf.supabase.co").replace(/\/$/, "");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ?? "sb_publishable_b23qXSqWre20GrAYV2ydrw_Cf9pv43o";
export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  ?? "0x4AAAAAAEDhe_nNg-o9cOAI";
export const commerceConfigured = Boolean(supabaseUrl && anonKey && turnstileSiteKey);
const checkoutEndpoint = `${supabaseUrl}/functions/v1/checkout`;
const adminEndpoint = `${supabaseUrl}/functions/v1/admin`;

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "ระบบไม่สามารถทำรายการได้");
  return payload;
}

function publicHeaders(contentType = true) {
  return {
    apikey: anonKey,
    ...(contentType ? { "content-type": "application/json" } : {}),
  };
}

export function selectionKey(item: Pick<CartItem, "selectionIds">) {
  return Object.values(item.selectionIds ?? {}).filter(Boolean).sort().join("|");
}

export async function fetchCatalog(productId?: string) {
  if (!commerceConfigured) return { products: [] };
  const query = new URLSearchParams({ action: "catalog" });
  if (productId) query.set("productId", productId);
  return parseResponse<{ products: Array<Record<string, unknown>> }>(await fetch(`${checkoutEndpoint}?${query}`, {
    headers: publicHeaders(false), cache: "no-store",
  }));
}

export function catalogRowToProduct(row: Record<string, unknown>): Product {
  const images = ((row.product_images ?? []) as Array<{ image_url: string; position: number }>).sort((a, b) => a.position - b.position).map((image) => image.image_url);
  const variants = ((row.product_option_groups ?? []) as Array<{ id: string; name: string; position: number; product_options: Array<{ id: string; name: string; disabled: boolean; position: number }> }>).sort((a, b) => a.position - b.position).map((group) => ({ id: group.id, name: group.name, options: [...group.product_options].sort((a, b) => a.position - b.position).map((option) => ({ id: option.id, name: option.name, disabled: option.disabled })) }));
  return {
    id: String(row.id), slug: String(row.slug), name: String(row.name), description: String(row.description ?? ""),
    category: String(row.category ?? "other") as Product["category"],
    priceMin: Number(row.price_min_satang ?? 0) / 100, priceMax: Number(row.price_max_satang ?? 0) / 100,
    originalPriceMin: null, originalPriceMax: null, rating: null, reviewCount: 0, soldCount: Number(row.sold_count ?? 0),
    availability: row.status === "inactive" ? "OutOfStock" : "InStock", images, variants, sourceUrl: "", capturedAt: new Date().toISOString(),
  };
}

export async function createOrder(customer: CheckoutDraft, items: CartItem[], turnstileToken: string) {
  const response = await fetch(`${checkoutEndpoint}?action=order`, {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({
      customer,
      turnstileToken,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectionKey: selectionKey(item),
        selections: item.selections,
      })),
    }),
  });
  return parseResponse<{
    orderId: string;
    orderNumber: string;
    totalSatang: number;
    expiresAt: string;
    paymentAccount: PublicOrder["paymentAccount"];
    token: string;
  }>(response);
}

export async function fetchOrder(token: string) {
  return parseResponse<{ order: PublicOrder }>(await fetch(`${checkoutEndpoint}?action=order&token=${encodeURIComponent(token)}`, {
    headers: publicHeaders(false), cache: "no-store",
  }));
}

export async function recoverOrder(orderNumber: string, phone: string, turnstileToken: string) {
  return parseResponse<{ order: PublicOrder; token: string }>(await fetch(`${checkoutEndpoint}?action=recover-order`, {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ orderNumber, phone, turnstileToken }),
  }));
}

export async function uploadSlip(token: string, file: File, turnstileToken: string) {
  const body = new FormData();
  body.set("token", token);
  body.set("file", file);
  body.set("turnstileToken", turnstileToken);
  return parseResponse<{ status: string }>(await fetch(`${checkoutEndpoint}?action=slip`, {
    method: "POST", headers: publicHeaders(false), body,
  }));
}

export async function adminLogin(username: string, password: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email: `${username.trim().toLowerCase()}@admin.meemon.net`, password }),
  });
  return parseResponse<{ access_token: string; refresh_token: string; expires_in: number }>(response);
}

export async function adminRequest<T>(token: string, action: string, init: RequestInit = {}) {
  const isForm = init.body instanceof FormData;
  const response = await fetch(`${adminEndpoint}?action=${encodeURIComponent(action)}`, {
    ...init,
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${token}`,
      ...(!isForm ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  return parseResponse<T>(response);
}
