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

type VariantData = { variantId: string; colorHex: string };
// Structure: { [size]: { [color]: { variantId, colorHex } } }
type VariantMatrix = Record<string, Record<string, VariantData>>;

export function createVariantMatrix(variants: Variant[]): VariantMatrix {
  return variants.reduce((matrix, variant) => {
    const size = variant((o: any) => o.displayName === "Size")?.values[0]
      ?.label;
    const color = variant.sizeName.find((o: any) => o.displayName === "Color")
      ?.values[0]?.label;
    const colorHex = variant.sizeName.find(
      (o: any) => o.displayName === "Color",
    )?.values[0]?.hex;

    if (size && color) {
      if (!matrix[size]) matrix[size] = {};
      matrix[size][color] = {
        variantId: variant.id,
        colorHex: colorHex || "#000",
      };
    }
    return matrix;
  }, {} as VariantMatrix);
}
