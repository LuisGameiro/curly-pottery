import { ProductWithVariantsCategories } from "@lib/types/types";

export const sortLabels: Record<string, string> = {
  newest: "Newest first",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Alphabetically: A-Z",
  "name-desc": "Alphabetically: Z-A",
};

export type SortLabels = keyof typeof sortLabels;

export const sortProducts = (
  products: ProductWithVariantsCategories[],
  sortMethod: SortLabels,
) => {
  if (!Array.isArray(products)) return [];

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
    default:
      return list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
};
