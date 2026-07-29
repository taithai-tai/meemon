import Link from "next/link";
import { formatPrice } from "@/lib/data";
import type { Product } from "@/lib/types";
import { Icon } from "./Icons";

const categoryLabels = {
  wallets: "กระเป๋า & เครื่องหนัง",
  charms: "กำไล & เครื่องราง",
  sacred: "วัตถุมงคล",
  lifestyle: "ไลฟ์สไตล์",
  other: "คอลเลกชันพิเศษ",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/v2/shop/${product.slug}`} className="product-card">
      <div className="product-image">
        <img
          src={product.images[0] ?? "/v2/assets/brand/logo.png"}
          alt={product.name}
          loading="lazy"
        />
        {product.soldCount > 0 ? (
          <span className="sold-badge">ขายแล้ว {product.soldCount}</span>
        ) : null}
      </div>
      <div className="product-copy">
        <small>{categoryLabels[product.category]}</small>
        <h3>{product.name}</h3>
        <div className="product-meta">
          <strong>
            {formatPrice(product.priceMin)}
            {product.priceMax !== product.priceMin
              ? ` – ${formatPrice(product.priceMax)}`
              : ""}
          </strong>
          <span className="product-card-action">
            ดูสินค้า
            <Icon name="arrow-up-right" />
          </span>
        </div>
      </div>
    </Link>
  );
}
