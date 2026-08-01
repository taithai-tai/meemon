import type {
  CartItem,
  CheckoutDraft,
  CheckoutProvider,
} from "./types";

export const checkoutProvider: CheckoutProvider = {
  mode: "live",
  async createOrder(_draft: CheckoutDraft, _items: CartItem[]) {
    throw new Error("Use the protected commerce client with Turnstile verification.");
  },
};
