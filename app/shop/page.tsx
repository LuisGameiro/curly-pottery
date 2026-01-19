import ShopClient from "./ShopClient";
import { getProductsByCategorySlug } from "actions/product.actions";
import { getAllCategories } from "actions/category.actions";

export const metadata = {
  title: 'Shop - Curly Pottery',
  description: 'Explore our unique collection of handcrafted pottery at Curly Pottery. Discover artisanal ceramics perfect for your home or as thoughtful gifts.',
};


export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categorySlug = category || null;

  const categories = await getAllCategories();

  const products = await getProductsByCategorySlug(categorySlug);

  if (!products.success || !categories.success)
    throw new Error(products.message + categories.message);

  return (
    <ShopClient
      products={products.data || []}
      categories={categories.data || []}
      activeCategory={categorySlug}
    />
  );
}
