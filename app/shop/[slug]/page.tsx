import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductView from "@components/product/ProductView/ProductView";
import { getAllProducts, getProductBySlug } from "actions/product.actions";

// 1. Types for the page props
interface Props {
  params: { slug: string };
}

// 2. Replaces getStaticPaths: Generates static routes at build time
export async function generateStaticParams() {
  const products = await getAllProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

// 3. Replaces Head component: Handles SEO dynamically
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = {}//await getProductBySlug(params.slug);

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | Curly Pottery`,
    description: product.description || "",
  };
}

// 4. The Page Component (Server Component by default)
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  console.log(slug)
  // Fetch data directly in the component
  const product =  await getProductBySlug(slug);

  // Replaces return { notFound: true }
  if (!product) {
    notFound();
  }

  return <ProductView product={product} />;
}

// Replaces revalidate: 60
export const revalidate = 60;