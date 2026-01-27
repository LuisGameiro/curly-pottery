'use client'

import { Package, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Container, Text, Button, Input } from '@components/ui'
import InputCheckbox from '@components/ui/Input/InputCheckbox'
import InputImage from '@components/ui/Input/InputImage'
import { SizeNames } from '@lib/types/types'
import { VariantDetails } from './VariantDetails'
import { VariantDiscounts } from './VariantDiscounts'
import InputSelect from '@components/ui/Input/InputSelect'
import { Controller, useFormContext } from 'react-hook-form'
import { skulify } from '@lib/skulify'
import { useEffect } from 'react'

export const ProductVariant = ({
  index,
  onRemove,
}: {
  index: number
  onRemove: () => void
}) => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  const productName = watch(`name`)
  const sizeName = watch(`variants.${index}.sizeName`)
  const colorName = watch(`variants.${index}.colorName`)
  const isExpanded = watch(`variants.${index}.isExpanded`)
  const sku = watch(`variants.${index}.sku`)

  const variantData = watch(`variants.${index}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantErrors = (errors.variants as any)?.[index]

  useEffect(() => {
    const newSku = skulify(productName, sizeName, colorName)

    setValue(`variants.${index}.sku`, newSku, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [productName, sizeName, colorName, setValue, index])

  const toggleExpand = () => {
    setValue(`variants.${index}.isExpanded`, !isExpanded)
  }

  return (
    <Container variant="box" className="p-0 overflow-hidden">
      <div
        className={`p-4 flex items-center justify-between cursor-pointer border-b  ${variantErrors ? ' bg-red/20' : 'bg-secondary/20'}`}
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-4">
          <Package size={16} />
          <Text className="font-bold uppercase">{sku}</Text>
        </div>
        <div className="flex items-center gap-4">
          <Text className="text-sm">£{variantData.price}</Text>
          <Button
            type="button"
            variant="naked"
            color="danger"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <Trash2 size={16} />
          </Button>
          {variantData.isExpanded ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>
      </div>

      {variantData.isExpanded && (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="number"
              label="Price (£)"
              {...register(`variants.${index}.price`, { valueAsNumber: true })}
              error={variantErrors?.price?.message}
            />
            <Input
              type="number"
              label="Inventory Stock"
              {...register(`variants.${index}.stock`, { valueAsNumber: true })}
              error={variantErrors?.stock?.message}
            />
          </div>
          <div>
            <Text variant="subHeading">Size Variant</Text>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputSelect
                {...register(`variants.${index}.sizeName`)}
                options={Object.values(SizeNames)}
              />
            </div>
          </div>

          <div>
            <Text variant="subHeading">Color Variant</Text>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                {...register(`variants.${index}.colorName`)}
                error={variantErrors?.colorName?.message}
              />

              <Input
                label="Hex"
                type="color"
                className=" h-10 [&::-webkit-color-swatch-wrapper]:p-0 "
                {...register(`variants.${index}.colorHex`)}
                error={variantErrors?.colorHex?.message}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Controller
              name={`variants.${index}.availableForSale`}
              control={control}
              render={({ field }) => (
                <InputCheckbox
                  label="Available for Sale"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <VariantDetails variantIndex={index} />
          <VariantDiscounts variantIndex={index} />

          <Controller
            name={`variants.${index}.files`}
            control={control}
            render={({ field }) => (
              <InputImage
                multiple
                files={field.value}
                previews={watch(`variants.${index}.previews`)}
                onImagesChange={({ files, previews }) => {
                  field.onChange(files)
                  setValue(`variants.${index}.previews`, previews)
                }}
                error={variantErrors?.files?.message as string}
              />
            )}
          />
        </div>
      )}
    </Container>
  )
}
