"use client";

import { useEffect, useMemo, useState } from "react";
import { catalogRowToProduct, fetchCatalog } from "@/lib/commerce";
import { categories } from "@/lib/data";
import type { Product, ProductCategory } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { Icon } from "./Icons";

export function ShopClient({ products }: { products: Product[] }) {
  const [displayProducts, setDisplayProducts] = useState(products);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ProductCategory>("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    fetchCatalog().then(({ products: rows }) => {
      if (rows.length) setDisplayProducts(rows.map(catalogRowToProduct));
    }).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("th");
    const next = displayProducts.filter((product) => {
      const matchesCategory =
        category === "all" || product.category === category;
      const matchesQuery =
        !normalized ||
        product.name.toLocaleLowerCase("th").includes(normalized) ||
        product.description.toLocaleLowerCase("th").includes(normalized);
      return matchesCategory && matchesQuery;
    });

    return [...next].sort((left, right) => {
      if (sort === "price-low") return left.priceMin - right.priceMin;
      if (sort === "price-high") return right.priceMin - left.priceMin;
      if (sort === "popular") return right.soldCount - left.soldCount;
      return displayProducts.indexOf(left) - displayProducts.indexOf(right);
    });
  }, [category, displayProducts, query, sort]);

  return (
    <>
      <div className="shop-toolbar">
        <label className="search-field">
          <span>ค้นหาสินค้า</span>
          <span className="search-input-wrap">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="กระเป๋า กำไล การ์ดมงคล..."
            />
          </span>
        </label>
        <label className="sort-field">
          <span>เรียงตาม</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">สินค้าแนะนำ</option>
            <option value="popular">ยอดนิยม</option>
            <option value="price-low">ราคาน้อยไปมาก</option>
            <option value="price-high">ราคามากไปน้อย</option>
          </select>
        </label>
      </div>

      <div className="category-pills" aria-label="กรองหมวดหมู่">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            className={category === item.id ? "active" : ""}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="result-count">
        แสดง {filtered.length} จาก {displayProducts.length} รายการ
      </div>
      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard product={product} key={product.id} href={products.some((staticProduct) => staticProduct.id === product.id) ? undefined : `/v2/product/?id=${encodeURIComponent(product.id)}`} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="search" /></span>
          <h2>ยังไม่พบสินค้าที่ตรงกัน</h2>
          <p>ลองค้นหาด้วยคำอื่นหรือเลือกหมวด “ทั้งหมด”</p>
        </div>
      ) : null}
    </>
  );
}
