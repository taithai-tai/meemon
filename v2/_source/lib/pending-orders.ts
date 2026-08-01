import type { OrderStatus, PaymentAccountSnapshot, PublicOrder } from "./types";

export const PENDING_ORDERS_STORAGE_KEY = "meemon:v2:orders";
export const PENDING_ORDERS_EVENT = "meemon:v2:orders-changed";

export interface SavedOrder {
  token: string;
  orderNumber: string;
  phone?: string;
  totalSatang: number;
  expiresAt: string;
  createdAt: string;
  status: OrderStatus;
  paymentAccount: PaymentAccountSnapshot;
}

const validStatuses = new Set<OrderStatus>([
  "pending_payment", "verifying", "paid", "packing", "shipped", "completed",
  "verification_failed", "needs_review", "expired", "cancelled", "refunded",
]);

export function isOrderAwaitingCustomer(status: OrderStatus) {
  return status === "pending_payment" || status === "verification_failed" || status === "expired";
}

function isSavedOrder(value: unknown): value is SavedOrder {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<SavedOrder>;
  return typeof row.token === "string" && row.token.length >= 32
    && typeof row.orderNumber === "string"
    && typeof row.totalSatang === "number"
    && typeof row.expiresAt === "string"
    && typeof row.createdAt === "string"
    && typeof row.status === "string" && validStatuses.has(row.status as OrderStatus)
    && Boolean(row.paymentAccount);
}

export function readSavedOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PENDING_ORDERS_STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - 180 * 24 * 60 * 60 * 1000;
    return parsed.filter(isSavedOrder).filter((order) => Date.parse(order.createdAt) > cutoff).slice(0, 20);
  } catch {
    return [];
  }
}

function writeSavedOrders(orders: SavedOrder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_ORDERS_STORAGE_KEY, JSON.stringify(orders.slice(0, 20)));
  window.dispatchEvent(new Event(PENDING_ORDERS_EVENT));
}

export function rememberOrder(order: SavedOrder) {
  writeSavedOrders([order, ...readSavedOrders().filter((saved) => saved.token !== order.token && saved.orderNumber !== order.orderNumber)]);
}

export function rememberPublicOrder(order: PublicOrder, token: string) {
  rememberOrder({
    token,
    orderNumber: order.orderNumber,
    phone: order.shipping.phone,
    totalSatang: order.totalSatang,
    expiresAt: order.expiresAt,
    createdAt: order.createdAt,
    status: order.status,
    paymentAccount: order.paymentAccount,
  });
}

export function updateSavedOrderStatus(token: string, status: OrderStatus) {
  writeSavedOrders(readSavedOrders().map((order) => order.token === token ? { ...order, status } : order));
}
