"use client";

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductView from "@components/product/ProductView/ProductView";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "actions/product.actions";


// 1. Types for the page props
interface Props {
  params: { slug: string };
}


export default async function ProductCLient({ params }: Props) {
  const { slug } = params;

  console.log(slug)
  // Fetch data directly in the component
  const product = await getProductBySlug(slug);

  // Replaces return { notFound: true }
  if (!product) {
    notFound();
  }
  const relatedProducts = await getRelatedProducts(product.categories, product.id, 3);

  return <ProductView product={product} relatedProducts={relatedProducts} />;
}

// Replaces revalidate: 60
