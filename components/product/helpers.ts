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

type VariantData = {
  variantId: string;
  colorHex: string;
  isAvailable: boolean;
};
type VariantMatrix = Record<string, Record<string, VariantData>>;

export function createVariantMatrix(variants: Variant[]): VariantMatrix {
  // First, gather all unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.sizeName))).filter(
    (v) => v !== null,
  );
  const colors = Array.from(new Set(variants.map((v) => v.colorName))).filter(
    (v) => v !== null,
  );

  if (sizes.length === 0 || colors.length === 0) {
    return {};
  }

  // Initialize the matrix with empty objects for each size and color
  const matrix: VariantMatrix = {};

  for (const size of sizes) {
    for (const color of colors) {
      matrix[size][color] = {
        variantId: "",
        colorHex: "",
        isAvailable: false,
      };
    }
  }

  // Populate the matrix with actual variant data

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
