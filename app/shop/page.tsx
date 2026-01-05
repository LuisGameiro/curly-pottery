import { prisma } from "prisma/prisma";
import { serializeProduct, serializeProductVariant } from "actions/helpers";
import { Product } from "@lib/types/product";
import { Category } from "@lib/types/category";
import ShopClient from "./ShopClient";
import { getProductByCategorySlug } from "actions/product.actions";
import { getAllCategories } from "actions/category.actions";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {

  const { category } = await searchParams
  const categorySlug = category || null;

  const categories = await getAllCategories()

  const products = await getProductByCategorySlug(categorySlug)

  return (
    <ShopClient
      initialProducts={(products) as Product[]}
      categories={(categories) as Category[]}
      activeCategory={categorySlug}
    />
  );
}