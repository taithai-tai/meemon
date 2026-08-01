"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { catalogRowToProduct, fetchCatalog } from "@/lib/commerce";
import type { Product } from "@/lib/types";
import { ProductDetailClient } from "./ProductDetailClient";

export function LiveProductClient() {
  const id = useSearchParams().get("id") ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) { setError("ไม่พบรหัสสินค้า"); return; }
    fetchCatalog(id).then(({ products }) => products[0] ? setProduct(catalogRowToProduct(products[0])) : setError("ไม่พบสินค้า")).catch(() => setError("เปิดสินค้าไม่สำเร็จ"));
  }, [id]);
  if (error) return <div className="empty-state"><h2>{error}</h2><Link className="button button-gold" href="/v2/shop">กลับร้านค้า</Link></div>;
  if (!product) return <div className="empty-state">กำลังโหลดสินค้า…</div>;
  return <ProductDetailClient product={product} />;
}

