import {
  EditProduct,
  EditVariant,
} from "app/admin/products/[id]/ProductClient";
import { Product, Variant } from "./types/types";

export const skulify = (
  product: Product | EditProduct,
  variant: Variant | EditVariant,
): string => {
  const namePart = product.name
    .split(" ")
    .map((word) => word.slice(0, 3))
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
