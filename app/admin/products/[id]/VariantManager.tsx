"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Text } from "@components/ui";
import { ProductVariant } from "./ProductVariant";
import { toast } from "sonner";

export const VariantManager = () => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const addVariant = () => {
    append({
      id: `temp-${fields.length + 1}`,
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
      images: [],
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (fields.length === 1) {
      return toast.error("Product must have at least one variant.");
    }
    return confirm("Are you sure you want to remove this variant?") && remove(index);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-wide cursor-default">
            Variants
          </h2>
          <Text className="text-muted-foreground text-sm">
            ({fields.length})
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
        {fields.map((field, index) => (
          <ProductVariant
            key={field.id}
            index={index}
            onRemove={() => handleRemoveVariant(index)}
          />
        ))}
      </div>
    </div>
  );
};
