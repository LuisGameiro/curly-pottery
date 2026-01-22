// export type SelectedOptions = Record<string, string | null>;

import { Variant } from "@lib/types/types";

// export function getProductVariant(product: ProductWithVariantsCategories, opts: SelectedOptions) {
//   return product.variants.find((variant) => {
//     // Ensure the variant has the options/sizeName property you're looking for
//     // Using Boolean() or !! ensures the .find returns a clear true/false for .every()
//     return Object.entries(opts).every(([key, value]) => {
//       if (!value) return true; // Skip if no value selected for this option

//       return !!variant.sizeName?.find((option: any) => {
//         if (
//           option.__typename === "MultipleChoiceOption" &&
//           option.displayName.toLowerCase() === key.toLowerCase()
//         ) {
//           return option.values.find((v: any) => v.label.toLowerCase() === value.toLowerCase());
//         }
//         return false;
//       });
//     });
//   });
// }

// export function selectDefaultOptionFromProduct(
//   product: ProductWithVariantsCategories, // Changed to the extended type to ensure variants/options exist
//   updater: Dispatch<SetStateAction<SelectedOptions>>,
// ) {
//   const firstVariant = product.variants?.[0];
//   if (!firstVariant || !firstVariant.sizeName) return;

//   // Build the state object first to avoid multiple re-renders in a loop
//   const defaultChoices: SelectedOptions = {};

//   firstVariant.sizeName.forEach((v: any) => {
//     if (v.values?.[0]) {
//       defaultChoices[v.displayName.toLowerCase()] = v.values[0].label.toLowerCase();
//     }
//   });

//   updater((prev) => ({ ...prev, ...defaultChoices }));
// }

const SIZE_ORDER: Record<string, number> = {
  xxs: 1,
  xs: 2,
  s: 3,
  m: 4,
  l: 5,
  xl: 6,
  xxl: 7,
};

type VariantData = {
  variantId: string;
  colorHex: string;
  isAvailable: boolean;
};
type VariantMatrix = Record<string, Record<string, VariantData>>;

export function createVariantMatrix(variants: Variant[]): VariantMatrix {
  const rawSizes = Array.from(new Set(variants.map((v) => v.sizeName))).filter(
    (v) => v !== null,
  );
  const rawColors = Array.from(
    new Set(variants.map((v) => v.colorName)),
  ).filter((v) => v !== null);

  if (rawSizes.length === 0 || rawColors.length === 0) {
    return {};
  }

  const sizes = rawSizes.sort((a, b) => {
    const orderA = SIZE_ORDER[a.toLowerCase()] || 99;
    const orderB = SIZE_ORDER[b.toLowerCase()] || 99;
    return orderA - orderB;
  });

  const colors = rawColors.sort((a, b) => a.localeCompare(b));

  const matrix: VariantMatrix = {};

  for (const size of sizes) {
    matrix[size] = {};
    for (const color of colors) {
      matrix[size][color] = {
        variantId: "",
        colorHex: "",
        isAvailable: false,
      };
    }
  }

  variants.forEach((variant) => {
    const size = variant.sizeName;
    const color = variant.colorName;
    if (size && color) {
      matrix[size][color] = {
        variantId: variant.id,
        colorHex: variant.colorHex || "#000",
        isAvailable: true,
      };
    }
  });

  return matrix;
}
