"use client";

import { memo, useState } from "react";
import { Text } from "@components/ui";
import { ProductWithVariantsCategories, Variant } from "@lib/types/types";
import { createVariantMatrix } from "../helpers";

interface ProductOptionsProps {
  product: ProductWithVariantsCategories;
  setVariant: (variant: Variant) => void;
}

const ProductOptions = ({ product, setVariant }: ProductOptionsProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const matrix = createVariantMatrix(product.variants);
  const allSizes = Object.keys(matrix);
  const allColors = Array.from(
    new Set(product.variants.flatMap((v: Variant) => v.colorName)),
  ) as string[];

  return (
    <div>
      {allSizes.length > 1 && (
        <div>
          <Text variant="sectionHeading">Size</Text>
          <div role="listbox" className="flex flex-row">
            {allSizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 mr-2 border rounded-md ${
                  selectedSize === size ? "border-green-300" : "border-red-500"
                }`}
                onClick={() => {
                  setVariant(
                    product.variants.find(
                      (v: Variant) =>
                        v.id ===
                        matrix[size][selectedColor || allColors[0]]?.variantId,
                    )!,
                  );
                  setSelectedSize(size === selectedSize ? null : size);
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      {allColors.length > 1 && (
        <div>
          <Text variant="sectionHeading">Color</Text>
          <div role="listbox" className="flex flex-row">
            {allColors.map((color) => {
              const isDisabled = selectedSize
                ? !matrix[selectedSize]?.[color]
                : false;
              const colorData = matrix[selectedSize || allSizes[0]]?.[color];
              return (
                <button
                  key={color}
                  className={`px-4 py-2 mr-2 border rounded-md bg-${colorData.colorHex} ${
                    selectedColor === color
                      ? "border-green-300"
                      : "border-red-500"
                  }`}
                  disabled={isDisabled}
                  onClick={() => {
                    // setVariant(
                    //   product.variants.find(
                    //     (v: Variant) =>
                    //       v.id ===
                    //       matrix[selectedSize][color]?.variantId,
                    //   )!,
                    // );
                    setSelectedColor(color === selectedColor ? null : color);
                  }}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductOptions);
