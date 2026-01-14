"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@lib/utils";
import { ProductCard } from "@components/product";
import { Container, Skeleton } from "@components/ui";
import { Product } from "@lib/types/product";
import { Category } from "@lib/types/category";
import ClickOutside from "@lib/click-outside";

const sortLabels = {
  newest: "Newest first",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Alphabetically: A-Z",
  "name-desc": "Alphabetically: Z-A",
};

interface ShopClientProps {
  initialProducts: Product[];
  categories: Category[];
  activeCategory: string | null;
  admin?: boolean;
}

export default function ShopClient({
  initialProducts = [],
  categories,
  activeCategory,
}: ShopClientProps) {
  const router = useRouter();
  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [sortMethod, setSortMethod] = useState<keyof typeof sortLabels>("newest");

  const sortedProducts = useMemo(() => {
    const list = [...initialProducts];
    switch (sortMethod) {
      case "price-asc":
        return list.sort((a, b) => Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price)));
      case "price-desc":
        return list.sort((a, b) => Math.max(...b.variants.map(v => v.price)) - Math.max(...a.variants.map(v => v.price)));
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [sortMethod, initialProducts]);

  const handleCategoryClick = (slug?: string) => {
    setOpenFilter(false);
    if (slug) {
      router.push(`/shop?category=${slug}`);
    } else {
      router.push(`/shop`);
    }
  };

  return (
    <main className="bg-gradient-to-r from-background to-accent-1 py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="gap-2 lg:col-span-3 flex flex-col sm:flex-row lg:flex-col ">
          <div className="relative w-full z-30">
            <label className="text-xs font-bold uppercase tracking-wider text-accent-6 ml-1 mb-1 block">
              Sort by
            </label>

            <button
              className="w-full bg-accent-1 text-text-base border-2 border-border px-4 py-3 rounded-lg font-semibold flex justify-between items-center hover:bg-background transition-colors lg:cursor-default lg:hover:bg-accent-1 lg:hidden"
              onClick={() => setOpenSort((v) => !v)}
            >
              <span>{sortLabels[sortMethod]}</span>
              <svg
                className={cn("transition-transform", openSort && "rotate-180")}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </button>
            <ClickOutside active={openSort} onClick={() => setOpenSort(!openSort)}>

              <ul
                className={cn(
                  "space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block transition-all",
                  "absolute left-0 right-0 top-full lg:static z-50", // This line prevents the push-down
                  { hidden: !openSort },
                )}
              >
                {Object.entries(sortLabels).map(([key, label]) => (
                  <li
                    key={key}
                    className={cn(
                      "px-4 py-2 rounded-md cursor-pointer transition-colors flex items-center justify-between",
                      sortMethod === key
                        ? "bg-secondary text-secondary-foreground font-bold"
                        : "hover:bg-accent-1 text-text-secondary hover:text-text-base font-medium",
                    )}
                    onClick={() => {
                      setSortMethod(key as keyof typeof sortLabels);
                      setOpenSort(false); // Close on selection
                    }}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </ClickOutside>
          </div>

          <div className="relative w-full z-30">
            <label className="text-xs font-bold uppercase tracking-wider text-accent-6 ml-1 mb-1 block">
              Browse
            </label>

            <button
              className="w-full bg-accent-1 text-text-base border-2 border-border px-4 py-3 rounded-lg font-semibold flex justify-between items-center hover:bg-white transition-colors lg:cursor-default lg:hover:bg-accent-1 lg:hidden"
              onClick={() => setOpenFilter((v) => !v)}
            >
              <span>{activeCategory || "All Categories"}</span>
              <svg
                className={cn(
                  "transition-transform",
                  openFilter && "rotate-180",
                )}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </button>
            <ClickOutside active={openFilter} onClick={() => setOpenFilter(!openFilter)}>
              <ul
                className={cn(
                  "space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block transition-all",
                  "absolute left-0 right-0 top-full lg:static z-50", // This line prevents the push-down
                  { hidden: !openFilter },
                )}
              >
                <li
                  className={cn(
                    "px-4 py-2 rounded-md cursor-pointer transition-colors",
                    !activeCategory
                      ? "bg-secondary text-secondary-foreground font-bold shadow-sm"
                      : "hover:bg-accent-1 text-text-secondary hover:text-text-base font-medium",
                  )}
                  onClick={() => handleCategoryClick()}
                >
                  All Products
                </li>

                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className={cn(
                      "px-4 py-2 rounded-md cursor-pointer transition-colors flex items-center justify-between",
                      activeCategory === cat.name || activeCategory === cat.slug
                        ? "bg-secondary text-secondary-foreground font-bold shadow-sm"
                        : "hover:bg-accent-1 text-text-secondary hover:text-text-base font-medium",
                    )}
                    onClick={() => handleCategoryClick(cat.slug)}
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            </ClickOutside>

          </div>
        </aside>

        <main className="lg:col-span-9">
          {sortedProducts.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="simple"
                />
              ))}
            </div>
          ) : (
            /* Skeleton logic */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i}><div className="w-full h-64" /></Skeleton>
              ))}
            </div>
          )}
        </main>
      </div>
    </main>
  );
}