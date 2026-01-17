"use client";

import { Plus, Trash2 } from "lucide-react";
import { Text, Button, Input } from "@components/ui";
import { Discount, DiscountType } from "@lib/types/types";
import InputSelect from "@components/ui/Input/InputSelect";

interface Props {
  discounts: Discount[];
  onChange: (discounts: Discount[]) => void;
}

export const VariantDiscounts = ({ discounts = [], onChange }: Props) => {
  const addDiscount = () => {
    onChange([
      ...discounts,
      {
        code: "",
        type: "PERCENTAGE",
        value: 0,
        percentage: 0,
        amountSaved: 0,
      },
    ]);
  };

  return (
    <div className="space-y-4 bg-green-50/50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <Text variant="subHeading">Discounts & Promos</Text>
        <Button
          variant="naked"
          size="sm"
          type="button"
          onClick={addDiscount}
          color="success"
        >
          <Plus size={14} /> Add Discount
        </Button>
      </div>
      {discounts.map((disc, index) => (
        <div className="flex gap-2 items-center" key={index}>
          <Input
            label="Code"
            value={disc.code}
            placeholder="If blank apllies to all orders"
            onChange={(e) => {
              const newD = [...discounts];
              newD[index].code = e.target.value;
              onChange(newD);
            }}
          />
          <InputSelect
            label="Type"
            value={disc.type}
            options={Object.values(DiscountType)}
            onChange={(e) => {
              const newD = [...discounts];
              newD[index].type = e.target.value as DiscountType;
              onChange(newD);
            }}
          />
          <Input
            label={disc.type === "PERCENTAGE" ? "%" : "Fixed Off"}
            type="number"
            value={disc.type === "PERCENTAGE" ? disc.percentage : disc.value}
            onChange={(e) => {
              const newD = [...discounts];
              const val = parseFloat(e.target.value);
              if (disc.type === "PERCENTAGE") newD[index].percentage = val;
              else newD[index].value = val;
              onChange(newD);
            }}
          />
          <Button
            variant="naked"
            color="danger"
            onClick={() => onChange(discounts.filter((_, i) => i !== index))}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
};
