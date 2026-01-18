import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@components/product/ProductView/ProductView";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "actions/product.actions";

export async function generateStaticParams() {
  const response = await getAllProducts();

  if (!response.success || !response.data) return [];

  return response.data.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const response = await getProductBySlug(slug);

  if (!response.success || !response.data) {
    return { title: "Product Not Found" };
  }

  const product = response.data;

  const url = `https://curlypottery.com/product/${slug}`;
  const productImage = product.images?.[0] || "/logo.png";

  return {
    title: `${product.name} | Curtly Pottery`,
    description:
      product.description?.slice(0, 160) ||
      `Unique hand-crafted ${product.name} by Curly Pottery.`,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description: product.description || "Beautiful hand-crafted pottery.",
      url: url,
      siteName: "Curly Pottery",
      images: [
        { url: productImage, width: 1200, height: 630, alt: product.name },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || "Hand-crafted pottery.",
      images: [productImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const response = await getProductBySlug(slug);

  if (!response.success || !response.data) {
    notFound();
  }

  const product = response.data;

  const relatedResponse = await getRelatedProducts(
    product.categories,
    product.id,
  );

  return (
    <ProductView
      product={product}
      relatedProducts={relatedResponse.data ?? []}
    />
  );
}
