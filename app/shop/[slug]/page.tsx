import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@components/product/ProductView/ProductView";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "actions/product.actions";

export async function generateStaticParams() {
  const products = await getAllProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Curly Pottery`,
    description: product.description || "",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const relatedProducts = await getRelatedProducts(product.categories || [], product.id || '');


  if (!product) {
    notFound();
  }

  return <ProductView product={product} relatedProducts={relatedProducts} />;
}

export const revalidate = 3000;
