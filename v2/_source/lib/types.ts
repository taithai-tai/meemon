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
  readonly mode: "prototype" | "live";
  createOrder(
    draft: CheckoutDraft,
    items: CartItem[],
  ): Promise<{ orderId: string }>;
  createPaymentSession(orderId: string): Promise<{ redirectUrl: string }>;
}
import type { IconName } from "@/app/components/Icons";
