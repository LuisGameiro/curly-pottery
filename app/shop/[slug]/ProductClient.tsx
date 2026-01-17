"use client";

import { notFound } from "next/navigation";
import ProductView from "@components/product/ProductView/ProductView";
import { getProductBySlug, getRelatedProducts } from "actions/product.actions";

export default async function ProductCLient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }
  const relatedProducts = await getRelatedProducts(
    product.categories,
    product.id,
    3,
  );

  return <ProductView product={product} relatedProducts={relatedProducts} />;
}
