import type {
  CartItem,
  CheckoutDraft,
  CheckoutProvider,
} from "./types";

export const prototypeCheckoutProvider: CheckoutProvider = {
  mode: "prototype",
  async createOrder(_draft: CheckoutDraft, _items: CartItem[]) {
    throw new Error("Prototype checkout never creates an order.");
  },
  async createPaymentSession(_orderId: string) {
    throw new Error("Prototype checkout never creates a payment session.");
  },
};
