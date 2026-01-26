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
    Object.keys(matrix)[0],
  )

  const [selectedColor, setSelectedColor] = useState<string>(
    Object.keys(matrix[Object.keys(matrix)[0]])[0],
  )

  const allSizes = Object.keys(matrix)
  const allColors = Array.from(
    new Set(product.variants.flatMap((v: Variant) => v.colorName)),
  ) as string[]

  return (
    <>
      {allSizes.length > 1 && (
        <div>
          <Text variant="bold">Size</Text>
          <div role="listbox" className="flex flex-row mt-2">
            {allSizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 mr-2 rounded-md border border-border

                  ${selectedSize === size ? 'bg-green' : 'bg-primary'}`}
                onClick={() => {
                  const colorToUse = matrix[size]?.[selectedColor ?? '']
                    ?.variantId
                    ? selectedColor
                    : Object.keys(matrix[size] ?? {})[0]

                  const variantToSet = product.variants.find(
                    (v: Variant) =>
                      v.id === matrix[size]?.[colorToUse ?? '']?.variantId,
                  )

                  if (variantToSet) setVariant(variantToSet)
                  setSelectedColor(colorToUse)
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
        <div>
          <Text variant="bold">Color</Text>
          <div role="listbox" className="flex flex-row mt-2">
            {allColors.map((color) => {
              return (
                <button
                  key={color}
                  className={`px-4 py-2 mr-2 border rounded-md 
                    ${matrix[selectedSize]?.[color]?.isAvailable ? (selectedColor === color ? 'bg-green' : 'bg-primary') : 'bg-gray-500'}`}
                  disabled={
                    matrix[selectedSize]?.[color]?.isAvailable === false
                  }
                  onClick={() => {
                    setVariant(
                      product.variants.find(
                        (v: Variant) =>
                          v.id === matrix[selectedSize][color]?.variantId,
                      )!,
                    )
                    setSelectedColor(color)
                  }}
                >
                  <Text variant="bold">{color}</Text>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default memo(ProductOptions)
