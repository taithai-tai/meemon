"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [added, setAdded] = useState(false);
  const { addProduct } = useCart();

  function addToCart() {
    addProduct(product, selections, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  function buyNow() {
    addProduct(product, selections, quantity);
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
          {formatPrice(product.priceMin)}
          {product.priceMax !== product.priceMin
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
                  className={selections[group.name] === option.name ? "active" : ""}
                  onClick={() =>
                    setSelections((current) => ({
                      ...current,
                      [group.name]: option.name,
                    }))
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
          <button type="button" className="primary-button grow" onClick={addToCart}>
            <Icon name={added ? "check" : "cart"} />
            {added ? "เพิ่มลงตะกร้าแล้ว" : "เพิ่มลงตะกร้า"}
          </button>
          <button type="button" className="button button-ghost grow" onClick={buyNow}>
            ซื้อเลย (ทดลอง)
            <Icon name="arrow-right" />
          </button>
        </div>

        <Link className="product-cart-link" href="/v2/cart">
          <Icon name="cart" />
          ดูตะกร้าของฉัน
          <Icon name="arrow-right" />
        </Link>

        <div className="prototype-note">
          รุ่นทดลองนี้ให้ลองเลือกสินค้า กรอกที่อยู่ และเปิด QR จำลองได้ครบ แต่จะไม่สร้างคำสั่งซื้อ ไม่ส่งข้อมูล และไม่รับเงินจริง
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
