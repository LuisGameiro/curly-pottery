import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductView from "@components/product/ProductView/ProductView";
import { getAllProducts, getProductBySlug } from "actions/product.actions";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = await getAllProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | Curly Pottery`,
    description: product.description || "",
  };
}

export default async function ProductPage({ params }: Promise<{ params: string }>) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductView product={product} />;
}

export const revalidate = 3000;