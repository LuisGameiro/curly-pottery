"use client";

import { Package, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Container, Text, Button, Input } from "@components/ui";
import InputCheckbox from "@components/ui/Input/InputCheckbox";
import InputImage from "@components/ui/Input/InputImage";
import { SizeNames, Detail, EditProduct, EditVariant } from "@lib/types/types";
import { skulify } from "@lib/skulify";
import { VariantDetails } from "./VariantDetails";
import { VariantDiscounts } from "./VariantDiscounts";
import InputSelect from "@components/ui/Input/InputSelect";
import { Discount } from "@lib/types/types";

interface PorductVariantProps {
  variant: EditVariant;
  product: EditProduct;
  onUpdate: (field: string, value: unknown) => void;
  onRemove: () => void;
  onToggle: () => void;
}

export const ProductVariant = ({
  variant,
  product,
  onUpdate,
  onRemove,
  onToggle,
}: PorductVariantProps) => {
  return (
    <Container variant="box" className="p-0 overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-secondary/20 hover:bg-secondary/30 transition"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <Package size={16} />
          <Text className="font-bold">
            {skulify(product, variant) || "New Variant"}
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <Text className="text-sm font-medium">£{variant.price}</Text>
          <Button
            variant="naked"
            color="danger"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 size={16} />
          </Button>
          {variant.isExpanded ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>
      </div>

      {variant.isExpanded && (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="number"
              label="Price (£)"
              value={variant.price ?? 0}
              onChange={(e) => onUpdate("price", parseFloat(e.target.value))}
            />

            <Input
              label="Inventory Stock"
              type="number"
              value={variant.stock ?? 0}
              onChange={(e) => onUpdate("stock", parseInt(e.target.value))}
            />
          </div>

          <div>
            <Text variant="subHeading">Size Variant</Text>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputSelect
                value={variant.sizeName ?? ""}
                options={Object.values(SizeNames)}
                onChange={(e) => onUpdate("sizeName", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Text variant="subHeading">Color Variant</Text>

            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                value={variant.colorName ?? ""}
                onChange={(e) => onUpdate("colorName", e.target.value)}
              />

              <Input
                label="Hex"
                type="color"
                className=" h-10 [&::-webkit-color-swatch-wrapper]:p-0 "
                value={variant.colorHex ?? ""}
                onChange={(e) => onUpdate("colorHex", e.target.value)}
              />
            </div>
          </div>

          <InputCheckbox
            label="Available for Sale"
            checked={variant.availableForSale}
            onChange={(e) => onUpdate("availableForSale", e.target.checked)}
          />

          <VariantDetails
            details={(variant.details ?? []) as Detail[]}
            onChange={(val) => onUpdate("details", val)}
          />

          <VariantDiscounts
            discounts={(variant.discounts ?? []) as Discount[]}
            onChange={(val) => onUpdate("discounts", val)}
          />

          <InputImage
            label="Variant Images"
            multiple={true}
            files={variant.files}
            previews={variant.previews}
            onImagesChange={({ files, previews }) => {
              onUpdate("files", files);
              onUpdate("previews", previews);
            }}
            // error={errors.images}
          />
        </div>
      )}
    </Container>
  );
};
