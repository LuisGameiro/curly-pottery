import { Product } from "@lib/types/types";
import { Category } from "@lib/types/types";
import ShopClient from "./ShopClient";
import { getProductsByCategorySlug } from "actions/product.actions";
import { getAllCategories } from "actions/category.actions";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categorySlug = category || null;

  const categories = await getAllCategories();

  const products = await getProductsByCategorySlug(categorySlug);

  return (
    <ShopClient
      initialProducts={products.data as Product[]}
      categories={categories.data as Category[]}
      activeCategory={categorySlug}
    />
  );
}
