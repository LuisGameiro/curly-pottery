"use client";

import { Plus, Trash2 } from "lucide-react";
import { Text, Button, Input } from "@components/ui";
import { Detail, Detailtype } from "@lib/types/types";
import InputSelect from "@components/ui/Input/InputSelect";

interface VariantDetailsProps {
  details: Detail[];
  onChange: (details: Detail[]) => void;
}

export const VariantDetails = ({
  details = [],
  onChange,
}: VariantDetailsProps) => {
  const addDetail = () => {
    onChange([...details, { title: Detailtype.Materials, description: "" }]);
  };

  const updateDetail = (index: number, field: string, value: string) => {
    const newDetails = details.map((d, i) =>
      i === index ? { ...d, [field]: value } : d,
    );
    onChange(newDetails);
  };

  const removeDetail = (index: number) => {
    onChange(details.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 bg-primary/10 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <Text variant="subHeading">Technical Details</Text>
        <Button
          variant="naked"
          size="sm"
          onClick={addDetail}
          type="button"
          color="success"
        >
          <Plus size={14} /> Add Detail
        </Button>
      </div>
      {details.map((detail, index) => (
        <div key={index} className="flex gap-2 items-center">
          <InputSelect
            className="w-1/3"
            value={detail.title}
            options={Object.values(Detailtype)}
            onChange={(e) => updateDetail(index, "title", e.target.value)}
          />
          <Input
            className="flex-1"
            placeholder="e.g. 100% Stoneware"
            value={detail.description}
            onChange={(e) => updateDetail(index, "description", e.target.value)}
          />
          <Button
            variant="naked"
            color="danger"
            type="button"
            onClick={() => removeDetail(index)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
};
