import { memo } from "react";
import { Swatch } from "@components/product";
import type { ProductOption } from "@lib/types/inspiration/product";
import { SelectedOptions } from "../helpers";
import { Product, ProductVariant } from "prisma/generated/prisma/client";
import { FullProduct } from "@lib/types/product";
import { Text } from "@components/ui";

interface ProductOptionsProps {
  product: FullProduct;
  variant: ProductVariant;
  setVariant: (variant: ProductVariant) => void;
}

type UniqueSize = {
  name: string;
  id: string;
  available: boolean;
};

type uniqueColor = {
  name: string;
  id: string;
  colorHex: string;
  available: boolean;
};

const ProductOptions: React.FC<ProductOptionsProps> = ({
  product,
  variant,
  setVariant,
}) => {

// 1. Filter variants to find those that have a "size" option
// 2. Reduce them into a unique list based on the size name
const uniqueSizes: UniqueSize[] = product.variants.reduce((acc: UniqueSize[], variant) => {
  const sizeName = variant.sizeName;
  
  if (sizeName && !acc.find((item) => item.name === sizeName)) {
    acc.push({
      name: sizeName,
      id: variant.id, 
      available: variant.availableForSale
    });
  }
  return acc;
}, []);

const uniqueColors: uniqueColor[] = product.variants.reduce((acc: uniqueColor[], variant) => {
  const colorName = variant.colorName;
  
  if (colorName && !acc.find((item) => item.name === colorName)) {
    acc.push({
      name: colorName,
      id: variant.id, 
      colorHex: variant.colorHex || '',
      available: variant.availableForSale
    });
  }
  return acc;
}, []);

  return (
    <div>
      {uniqueSizes.length > 1 && (
        <div >
          <Text variant="sectionHeading">Size</Text>
          <div role="listbox" className="flex flex-row">
            {uniqueSizes.map((size) => (
              <button
                key={size.id}
                className={`px-4 py-2 mr-2 border rounded-md ${
                  size.available ? "border-green-300" : "border-red-500"
                }`}
                // disabled={!size.available}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {uniqueColors.length > 1&& (
        <div>
          <Text variant="sectionHeading">Color</Text>
          <div role="listbox" className="flex flex-row">
            {uniqueColors.map((color) => (
              <button
                key={color.id}
                className={`px-4 py-2 mr-2 border rounded-md bg-${color.colorHex} ${
                  color.available ? "border-green-300" : "border-red-500"
                }`}
                // disabled={!color.available}
              >
                {/* {color.name} */}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductOptions);
