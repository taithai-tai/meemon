import { notFound } from "next/navigation";
import { BackLink } from "../../../components/PageElements";
import { ProductDetailClient } from "../../../components/ProductDetailClient";
import { findProduct, products } from "@/lib/data";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  return { title: product?.name ?? "สินค้า" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();
  return (
    <section className="page-shell">
      <BackLink href="/v2/shop" label="กลับร้านค้า" />
      <ProductDetailClient product={product} />
    </section>
  );
}
