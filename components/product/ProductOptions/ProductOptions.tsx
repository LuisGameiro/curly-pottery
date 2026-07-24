'use client'

import { memo, useMemo, useState } from 'react'
import { Text } from '@components/ui'
import { ProductWithVariantsCategories, Variant } from '@lib/types/types'
import { createVariantMatrix } from '../helpers'

interface ProductOptionsProps {
  product: ProductWithVariantsCategories
  setVariant: (variant: Variant) => void
}

const ProductOptions = ({ product, setVariant }: ProductOptionsProps) => {
  const matrix = useMemo(
    () => createVariantMatrix(product.variants),
    [product.variants],
  )

  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants[0]?.sizeName || '',
  )

  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants[0]?.colorName || '',
  )

  const allSizes = Object.keys(matrix)
  const allColors = Array.from(
    new Set(product.variants.flatMap((v: Variant) => v.colorName)),
  ) as string[]

  return (
    <div className="flex flex-wrap justify-between gap-4">
      {allSizes.length > 1 && (
        <div data-testid="product-size-options">
          <Text variant="bold">Size</Text>
          <div role="listbox" className="flex mt-2 gap-2">
            {allSizes.map((size) => (
              <button
                key={size}
                className={`px-3 py-1.5 rounded-lg border border-border

                  ${selectedSize === size ? 'bg-secondary' : 'bg-muted'}`}
                onClick={() => {
                  const colorToUse = matrix[size]?.[selectedColor]?.variantId
                    ? selectedColor
                    : Object.entries(matrix[size] || {}).find(
                        ([_, details]) => details.isAvailable,
                      )?.[0]

                  const variantToSet = product.variants.find(
                    (v: Variant) =>
                      v.id === matrix[size]?.[colorToUse!]?.variantId,
                  )

                  if (variantToSet) setVariant(variantToSet)
                  setSelectedColor(colorToUse!)
                  setSelectedSize(size)
                }}
              >
                <Text variant="bold">{size}</Text>
              </button>
            ))}
          </div>
        </div>
      )}
      {allColors.length > 1 && (
        <div data-testid="product-color-options">
          <Text variant="bold">Color</Text>
          <div role="listbox" className="flex mt-2 gap-2">
            {allColors.map((color) => {
              return (
                <button
                  key={color}
                  className={`px-3 py-1.5 rounded-lg border border-border
                    ${matrix[selectedSize]?.[color!]?.isAvailable ? (selectedColor === color ? `bg-[${matrix[selectedSize]?.[color!].colorHex}]/60 border-secondary` : `bg-[${matrix[selectedSize]?.[color!].colorHex}] border-muted`) : 'bg-muted opacity-20'}`}
                  disabled={
                    matrix[selectedSize]?.[color!]?.isAvailable === false
                  }
                  onClick={() => {
                    setVariant(
                      product.variants.find(
                        (v: Variant) =>
                          v.id === matrix[selectedSize][color!]?.variantId,
                      )!,
                    )
                    setSelectedColor(color!)
                  }}
                >
                  <Text variant="bold">{color}</Text>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(ProductOptions)
