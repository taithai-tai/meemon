export type ProductCategory =
  | "wallets"
  | "charms"
  | "sacred"
  | "lifestyle"
  | "other";

export interface ProductVariantOption {
  id: string;
  name: string;
  disabled: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: ProductVariantOption[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  priceMin: number;
  priceMax: number;
  originalPriceMin: number | null;
  originalPriceMax: number | null;
  rating: number | null;
  reviewCount: number;
  soldCount: number;
  availability: string;
  images: string[];
  variants: ProductVariant[];
  sourceUrl: string;
  capturedAt: string;
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selections: Record<string, string>;
  selectionIds: Record<string, string>;
}

export interface CheckoutDraft {
  fullName: string;
  phone: string;
  address: string;
  province: string;
  postalCode: string;
  note: string;
}

export interface ContentModule {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: IconName;
  legacy?: boolean;
}

export interface TarotCard {
  name: string;
  file: string;
  meaning: string;
  image: string;
}

export interface Wallpaper {
  name: string;
  icon: string;
  sub: string;
  url: string;
}

export interface CheckoutProvider {
  readonly mode: "live";
  createOrder(
    draft: CheckoutDraft,
    items: CartItem[],
  ): Promise<{ orderId: string }>;
}
import type { IconName } from "@/app/components/Icons";

export type OrderStatus =
  | "pending_payment" | "verifying" | "paid" | "packing" | "shipped"
  | "completed" | "verification_failed" | "needs_review" | "expired"
  | "cancelled" | "refunded";

export interface PaymentAccountSnapshot {
  bankCode: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
}

export interface PublicOrder {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  totalSatang: number;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  paymentAccount: PaymentAccountSnapshot;
  shipping: CheckoutDraft;
  items: Array<{
    name: string;
    variant: string;
    image: string | null;
    unitPriceSatang: number;
    quantity: number;
    lineTotalSatang: number;
  }>;
}
