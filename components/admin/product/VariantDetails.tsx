'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Text, Button, Input } from '@components/ui'
import { Detailtype } from '@lib/types/types'
import InputSelect from '@components/ui/Input/InputSelect'
import { useFormContext, useFieldArray } from 'react-hook-form'
export const VariantDetails = ({ variantIndex }: { variantIndex: number }) => {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.details`,
  })

  return (
    <div className="space-y-4 bg-primary/20 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <Text variant="subHeading">Technical Details</Text>
        <Button
          variant="naked"
          size="sm"
          type="button"
          color="success"
          onClick={() => append({ title: 'Materials', description: '' })}
        >
          <Plus size={14} /> Add Detail
        </Button>
      </div>
      {fields.map((field, detailIndex) => (
        <div key={field.id} className="flex gap-2 items-center">
          <InputSelect
            className="w-1/3"
            options={Object.values(Detailtype)}
            {...register(
              `variants.${variantIndex}.details.${detailIndex}.title`,
            )}
          />
          <Input
            className="flex-1"
            {...register(
              `variants.${variantIndex}.details.${detailIndex}.description`,
            )}
          />
          <Button
            variant="naked"
            type="button"
            color="danger"
            onClick={() => remove(detailIndex)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
    </div>
  )
}
