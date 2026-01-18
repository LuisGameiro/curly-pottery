// "use client";

// import { notFound } from "next/navigation";
// import ProductView from "@components/product/ProductView/ProductView";
// import { getProductBySlug, getRelatedProducts } from "actions/product.actions";

// export default async function ProductCLient({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;
//   const resProduct = await getProductBySlug(slug);

//   if (!resProduct.success)
//     throw new Error(resProduct.message)

//   if (!resProduct.data) {
//     return notFound();
//   }

//   const product = resProduct.data

//   const relatedProducts = await getRelatedProducts(
//     product.categories,
//     product.id,
//     3,
//   );

//   return <ProductView product={product} relatedProducts={relatedProducts.data ?? []} />;
// }
