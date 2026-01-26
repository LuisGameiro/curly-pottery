'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Text, Button, Input } from '@components/ui'
import { DiscountType } from '@lib/types/types'
import InputSelect from '@components/ui/Input/InputSelect'
import { useFormContext, useFieldArray } from 'react-hook-form'

export const VariantDiscounts = ({
  variantIndex,
}: {
  variantIndex: number
}) => {
  const { control, register, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.discounts`,
  })

  return (
    <div className="space-y-4 bg-green-100/60 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <Text variant="subHeading">Discounts</Text>
        <Button
          variant="naked"
          size="sm"
          type="button"
          color="success"
          onClick={() =>
            append({ code: '', type: 'PERCENTAGE', value: 0, percentage: 0 })
          }
        >
          <Plus size={14} /> Add Discount
        </Button>
      </div>
      {fields.map((field, dIndex) => {
        const type = watch(`variants.${variantIndex}.discounts.${dIndex}.type`)
        return (
          <div key={field.id} className="flex gap-2 items-end">
            <Input
              label="Code"
              {...register(`variants.${variantIndex}.discounts.${dIndex}.code`)}
            />
            <InputSelect
              label="Type"
              options={Object.values(DiscountType)}
              {...register(`variants.${variantIndex}.discounts.${dIndex}.type`)}
            />
            <Input
              type="number"
              label={type === 'PERCENTAGE' ? '%' : 'Fixed'}
              {...register(
                `variants.${variantIndex}.discounts.${dIndex}.${type === 'PERCENTAGE' ? 'percentage' : 'value'}`,
                { valueAsNumber: true },
              )}
            />
            <Button
              variant="naked"
              type="button"
              color="danger"
              onClick={() => remove(dIndex)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
