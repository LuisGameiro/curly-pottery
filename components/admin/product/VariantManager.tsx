'use client'

import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Text } from '@components/ui'
import { ProductVariant } from './ProductVariant'
import { toast } from 'sonner'

export function VariantManager() {
  const { control } = useFormContext()

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'variants',
  })

  const addVariant = () => {
    append({
      id: `temp-${fields.length + 1}`,
      sku: '',
      price: 0,
      stock: 0,
      details: [],
      discounts: [],
      files: [],
      previews: [],
      sizeName: 'M',
      colorName: '',
      availableForSale: true,
      isExpanded: true,
      currency: 'GBP',
      colorHex: 'FFFFFF',
      images: [],
    })
  }

  const handleRemoveVariant = (index: number) => {
    if (fields.length === 1) {
      return toast.error('Product must have at least one variant.')
    }
    return (
      confirm('Are you sure you want to remove this variant?') && remove(index)
    )
  }

  return (
    <div className="space-y-4" data-testid="variant-manager">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Text variant="sectionHeading">Variants</Text>
          <Text className="text-muted text-sm">({fields.length})</Text>
        </div>
        <button
          type="button"
          onClick={addVariant}
          data-testid="variant-add-btn"
          className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary transition"
        >
          <Plus size={16} /> Add Variant
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <ProductVariant
            key={field.id}
            index={index}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onRemove={() => handleRemoveVariant(index)}
          />
        ))}
      </div>
    </div>
  )
}
