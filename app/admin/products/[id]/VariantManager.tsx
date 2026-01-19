"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Text } from "@components/ui";
import { EditProduct, EditVariant } from "@lib/types/types";
import { ProductVariant } from "./ProductVariant";

interface VariantManagerProps {
  product: EditProduct;
  variants: EditVariant[];
  setVariants: React.Dispatch<React.SetStateAction<EditVariant[]>>;
}

export const VariantManager = ({
  product,
  variants,
  setVariants,
}: VariantManagerProps) => {
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        sku: "",
        price: 0,
        stock: 0,
        details: [],
        discounts: [],
        files: [],
        previews: [],
        sizeName: "M",
        colorName: "",
        availableForSale: true,
        isExpanded: true,
        currency: "USD",
        colorHex: "FFFFFF",
        productId: product.id,
        images: [],
      },
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length === 1)
      return alert("Product must have at least one variant.");
    setVariants(variants.filter((v) => v.id !== id));
  };

  const toggleVariant = (id: string) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, isExpanded: !v.isExpanded } : v,
      ),
    );
  };

  const updateVariant = (id: string, field: string, value: unknown) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-wide cursor-default">
            Variants
          </h2>
          <Text className="text-muted-foreground text-sm">
            ({variants.length})
          </Text>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
        >
          <Plus size={16} /> Add Variant
        </button>
      </div>

      <div className="space-y-4">
        {variants.map((variant) => (
          <ProductVariant
            key={variant.id}
            variant={variant}
            product={product}
            onToggle={() => toggleVariant(variant.id)}
            onRemove={() => removeVariant(variant.id)}
            onUpdate={(field: string, value: unknown) =>
              updateVariant(variant.id, field, value)
            }
          />
        ))}
      </div>
    </div>
  );
};
