import { prisma } from "prisma/prisma";
import { serializeProduct, serializeProductVariant } from "actions/helpers";
import { Product } from "@lib/types/product";
import { Category } from "@lib/types/category";
import ShopClient from "./ShopClient";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categorySlug = searchParams.category || null;

  // Data fetching happens directly in the Server Component
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    where: categorySlug
      ? {
          categories: {
            some: { slug: categorySlug },
          },
        }
      : undefined,
    include: {
      categories: true,
      variants: true,
    },
  });

  return (
    <ShopClient
      initialProducts={serializeProductVariant(products) as Product[]}
      categories={serializeProduct(categories) as Category[]}
      activeCategory={categorySlug}
    />
  );
}