import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import { prisma } from "prisma/prisma";
import { cn } from "@lib/utils";

import { ProductCard } from "@components/product";
import { Skeleton } from "@components/ui";
import { Layout } from "@components/common";
import { Category } from "@lib/types/category";
import { Product } from "@lib/types/product";
import {
  serializeProduct,
  serializeProductVariant,
} from "actions/product.actions";

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  activeCategory: string | null;
}

export const getServerSideProps: GetServerSideProps<ShopPageProps> = async ({
  query,
}) => {
  const categorySlug =
    typeof query.category === "string" ? query.category : null;

  console.error("Category Slug:", categorySlug);

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    where: categorySlug
      ? {
          categories: {
            some: {
              slug: categorySlug, // Or whatever the field name is in your Category model
            },
          },
        }
      : undefined,
    include: {
      categories: true,
      variants: true,
    },
  });
  console.error("Category Slug:", products);

  return {
    props: {
      products: serializeProductVariant(products),
      categories: serializeProduct(categories),
      activeCategory: categorySlug,
    },
  };
};

/* ----------------------------------------
   PAGE
---------------------------------------- */

export default function Shop({
  products,
  categories,
  activeCategory,
}: ShopPageProps) {
  const router = useRouter();
  const [openFilter, setOpenFilter] = useState(false);
  const [sortMethod, setSortMethod] = useState("newest");

  const sortedProducts = useMemo(() => {
    // Create a copy so we don't mutate the original array
    const list = [...products];

    switch (sortMethod) {
      case "price-asc":
        return list.sort(
          (a, b) =>
            Math.min(...a.variants.map((v) => v.price)) -
            Math.min(...b.variants.map((v) => v.price)),
        );
      case "price-desc":
        return list.sort(
          (a, b) =>
            Math.max(...b.variants.map((v) => v.price)) -
            Math.max(...a.variants.map((v) => v.price)),
        );
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default: // 'newest'
        return list.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    }
  }, [sortMethod, products]);
  const handleCategoryClick = (slug?: string) => {
    setOpenFilter(false);
    router.replace(
      {
        pathname: "/shop",
        query: slug ? { category: slug } : {},
      },
      undefined,
      { shallow: false },
    );
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3  text-accent-3">
          <div className="flex items-center gap-2 mb-6">
            <label className="font-medium text-accent-6">Sort by:</label>
            <select
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
              className=" bg-primary font-semibold outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">A-Z</option>
              <option value="name-desc">Z-A</option>
            </select>
          </div>
          <button
            className="lg:hidden w-full border px-4 py-2"
            onClick={() => setOpenFilter((v) => !v)}
          >
            Categories
          </button>
          <ul className={cn("space-y-2 lg:block", { hidden: !openFilter })}>
            <li
              className={cn(
                "cursor-pointer font-medium",
                !activeCategory && "underline",
              )}
              onClick={() => handleCategoryClick()}
            >
              All Categories
            </li>

            {categories.map((cat) => (
              <li
                key={cat.id}
                className={cn(
                  "cursor-pointer hover:underline",
                  activeCategory === cat.name && "underline font-semibold",
                )}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </aside>

        <main className="lg:col-span-9">
          {products.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3  gap-2 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="simple"
                  imgProps={{
                    width: 480,
                    height: 480,
                    alt: product.name,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i}>
                  <div className="w-full h-64" />
                </Skeleton>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

Shop.Layout = Layout;
