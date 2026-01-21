"use client";

import { Suspense, useMemo, useState } from "react";
import { ProductCard } from "@components/product";
import { ProductWithVariantsCategories, Category } from "@lib/types/types";
import MenuProducts, { sortLabels } from "./MenuProducts";
import ProductsLoading from "./ProductsLoading";

interface ShopClientProps {
  products: ProductWithVariantsCategories[];
  categories: Category[];
  activeCategory: string | null;
  admin?: boolean;
}

export default function ShopClient({
  products = [],
  categories,
  activeCategory,
}: ShopClientProps) {
  const [sortMethod, setSortMethod] =
    useState<keyof typeof sortLabels>("newest");

  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    switch (sortMethod) {
      case "price-asc":
        return products.sort(
          (a, b) =>
            Math.min(...a.variants.map((v) => v.price)) -
            Math.min(...b.variants.map((v) => v.price)),
        );
      case "price-desc":
        return products.sort(
          (a, b) =>
            Math.max(...b.variants.map((v) => v.price)) -
            Math.max(...a.variants.map((v) => v.price)),
        );
      case "name-asc":
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return products.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [sortMethod, products]);

  return (
    <main className="bg-gradient-to-r from-background to-accent-1 py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <MenuProducts
          sortMethod={sortMethod}
          setSortMethod={setSortMethod}
          categories={categories}
          activeCategory={activeCategory}
        />

        <main className="lg:col-span-9">
          <Suspense fallback={<ProductsLoading />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="simple"
                />
              ))}
            </div>
          </Suspense>
        </main>
      </div>
    </main>
  );
}
