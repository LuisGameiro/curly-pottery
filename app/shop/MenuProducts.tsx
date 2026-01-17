import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@lib/utils";
import ClickOutside from "@lib/click-outside";
import { ChevronDown } from "lucide-react";

export const sortLabels: Record<string, string> = {
  newest: "Newest first",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Alphabetically: A-Z",
  "name-desc": "Alphabetically: Z-A",
};
export default function MenuProducts({
  setSortMethod,
  sortMethod,
  categories,
  activeCategory,
}: any) {
  const router = useRouter();

  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const handleCategoryClick = (slug?: string) => {
    setOpenFilter(false);
    if (slug) {
      router.push(`/shop?category=${slug}`);
    } else {
      router.push(`/shop`);
    }
  };

  return (
    <aside className="gap-2 lg:col-span-3 flex flex-col sm:flex-row lg:flex-col ">
      <div className="relative w-full z-30">
        <label className="text-xs font-bold uppercase tracking-wider text-accent-6 ml-1 mb-1 block">
          Sort by
        </label>

        <ClickOutside active={openSort} onClick={() => setOpenSort(!openSort)}>
          <div>
            <button
              className="w-full bg-accent-1 text-text-base border-2 border-border px-4 py-3 rounded-lg font-semibold flex justify-between items-center hover:bg-background transition-colors lg:cursor-default lg:hover:bg-accent-1 lg:hidden"
              onClick={() => setOpenSort((v) => !v)}
            >
              <span>{sortLabels[sortMethod]}</span>
              <ChevronDown
                size={18}
                className={cn("transition-transform", openSort && "rotate-180")}
              />
            </button>

            <ul
              className={cn(
                "absolute left-0 right-0 top-full space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl  transition-all",
                "lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block lg:static z-50",
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
                    setOpenSort(false);
                  }}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </ClickOutside>
      </div>

      <div className="relative w-full z-30">
        <label className="text-xs font-bold uppercase tracking-wider text-accent-6 ml-1 mb-1 block">
          Browse
        </label>
        <ClickOutside
          active={openFilter}
          onClick={() => setOpenFilter(!openFilter)}
        >
          <div>
            <button
              className="w-full bg-accent-1 text-text-base border-2 border-border px-4 py-3 rounded-lg font-semibold flex justify-between items-center hover:bg-white transition-colors lg:cursor-default lg:hover:bg-accent-1 lg:hidden"
              onClick={() => setOpenFilter((v) => !v)}
            >
              <span>{activeCategory || "All Categories"}</span>
              <ChevronDown
                size={18}
                className={cn("transition-transform", openSort && "rotate-180")}
              />
            </button>

            <ul
              className={cn(
                "absolute left-0 right-0 top-full space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl  transition-all",
                "lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block lg:static z-50",
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

              {categories.map((cat: any) => (
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
          </div>
        </ClickOutside>
      </div>
    </aside>
  );
}
