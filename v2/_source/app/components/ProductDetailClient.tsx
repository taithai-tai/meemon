"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { commerceConfigured, fetchCatalog } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { Icon } from "./Icons";

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.variants
        .filter((group) => group.options.some((option) => !option.disabled))
        .map((group) => [
          group.name,
          group.options.find((option) => !option.disabled)?.name ?? "",
        ]),
    ),
  );
  const [selectionIds, setSelectionIds] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.variants
        .filter((group) => group.options.some((option) => !option.disabled))
        .map((group) => [group.id, group.options.find((option) => !option.disabled)?.id ?? ""]),
    ),
  );
  const [liveSkus, setLiveSkus] = useState<Array<{ selection_key: string; price_satang: number | null; active: boolean; stock_quantity: number | null; reserved_quantity: number }>>([]);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const { addProduct } = useCart();

  useEffect(() => {
    fetchCatalog(product.id).then(({ products }) => {
      const live = products[0] as { status?: string; product_skus?: typeof liveSkus } | undefined;
      if (live) {
        setLiveStatus(live.status ?? null);
        setLiveSkus(live.product_skus ?? []);
      }
    }).catch(() => undefined);
  }, [product.id]);

  const selectedKey = useMemo(() => Object.values(selectionIds).filter(Boolean).sort().join("|"), [selectionIds]);
  const selectedSku = liveSkus.find((sku) => sku.selection_key === selectedKey);
  const staticPriced = product.priceMin === product.priceMax;
  const canBuy = commerceConfigured
    ? Boolean(selectedSku && selectedSku.active && selectedSku.price_satang !== null && liveStatus === "active" && (selectedSku.stock_quantity === null || selectedSku.stock_quantity > selectedSku.reserved_quantity))
    : staticPriced;
  const displayPrice = selectedSku?.price_satang !== null && selectedSku?.price_satang !== undefined ? selectedSku.price_satang / 100 : product.priceMin;
  const cartProduct = { ...product, priceMin: displayPrice, priceMax: displayPrice };

  function addToCart() {
    if (!canBuy) return;
    addProduct(cartProduct, selections, selectionIds, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  function buyNow() {
    if (!canBuy) return;
    addProduct(cartProduct, selections, selectionIds, quantity);
    router.push("/v2/checkout");
  }

  return (
    <div className="product-detail">
      <div className="product-gallery">
        <div className="product-main-image">
          <img
            src={product.images[imageIndex] ?? "/v2/assets/brand/logo.png"}
            alt={product.name}
          />
        </div>
        <div className="thumbnail-row">
          {product.images.slice(0, 10).map((image, index) => (
            <button
              key={image}
              type="button"
              className={imageIndex === index ? "active" : ""}
              onClick={() => setImageIndex(index)}
              aria-label={`ดูภาพที่ ${index + 1}`}
            >
              <img src={image} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <div className="product-info">
        <div className="eyebrow">MEEMON OFFICIAL COLLECTION</div>
        <h1>{product.name}</h1>
        <div className="detail-price">
          {formatPrice(displayPrice)}
          {!selectedSku && product.priceMax !== product.priceMin
            ? ` – ${formatPrice(product.priceMax)}`
            : ""}
        </div>
        <div className="detail-stats">
          <span>ขายแล้ว {product.soldCount}</span>
          <span>ภาพสินค้า {product.images.length}</span>
          <span>{product.availability === "InStock" ? "พร้อมจำหน่าย" : "ตรวจสอบสต็อก"}</span>
        </div>

        {product.variants.map((group) => (
          <fieldset className="variant-group" key={group.id}>
            <legend>{group.name}</legend>
            <div>
              {group.options.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  disabled={option.disabled}
                  className={selectionIds[group.id] === option.id ? "active" : ""}
                  onClick={() =>
                    {
                      setSelections((current) => ({ ...current, [group.name]: option.name }));
                      setSelectionIds((current) => ({ ...current, [group.id]: option.id }));
                    }
                  }
                >
                  {option.name}
                </button>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="purchase-row">
          <div className="quantity-picker">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              aria-label="ลดจำนวน"
            >
              <Icon name="minus" />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.min(99, current + 1))}
              aria-label="เพิ่มจำนวน"
            >
              <Icon name="plus" />
            </button>
          </div>
          <button type="button" className="primary-button grow" onClick={addToCart} disabled={!canBuy}>
            <Icon name={added ? "check" : "cart"} />
            {added ? "เพิ่มลงตะกร้าแล้ว" : canBuy ? "เพิ่มลงตะกร้า" : "รอกำหนดราคาตัวเลือก"}
          </button>
          <button type="button" className="button button-ghost grow" onClick={buyNow} disabled={!canBuy}>
            ซื้อเลย
            <Icon name="arrow-right" />
          </button>
        </div>

        <Link className="product-cart-link" href="/v2/cart">
          <Icon name="cart" />
          ดูตะกร้าของฉัน
          <Icon name="arrow-right" />
        </Link>

        <div className="prototype-note">
          {canBuy ? "ส่งฟรีทั่วประเทศ · ชำระโดยโอนผ่านธนาคารและตรวจสลิปก่อนจัดส่ง" : "สินค้านี้ยังแสดงให้ชมได้ แต่ยังสั่งซื้อไม่ได้จนกว่าร้านค้าจะกำหนดราคาครบทุกตัวเลือก"}
        </div>

        <div className="product-description">
          <h2>รายละเอียดสินค้า</h2>
          {product.description.split("\n").map((paragraph, index) => (
            <p key={`${paragraph}-${index}`}>{paragraph || "\u00a0"}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
