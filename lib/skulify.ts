import { FullProduct, Product, ProductVariant } from "./types/product";

export const skulify = (product: Product, variant: ProductVariant) => {
  const namePart = product.name
    .split(" ")
    .map((word) => word.slice(0, 3)) // Take first 3 letters of each word
    .join("-")
    .toLowerCase()
    .replace(/[^\w-]+/g, "") // Remove non-word chars
    .replace(/--+/g, "-") // Replace multiple dashes
    .trim()
    .toLowerCase();

  return `${namePart}-${variant.sizeName ?? ""}-${variant.colorName ?? ""}`.replace(
    /\s+/g,
    "-",
  );
};
