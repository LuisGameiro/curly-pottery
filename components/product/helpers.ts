import { Variant } from '@lib/types/types'

const SIZE_ORDER: Record<string, number> = {
  xxs: 1,
  xs: 2,
  s: 3,
  m: 4,
  l: 5,
  xl: 6,
  xxl: 7,
}

type VariantData = {
  variantId: string
  colorHex: string
  isAvailable: boolean
}
type VariantMatrix = Record<string, Record<string, VariantData>>

export function createVariantMatrix(variants: Variant[]): VariantMatrix {
  const rawSizes = Array.from(new Set(variants.map((v) => v.sizeName))).filter(
    (v) => v !== null,
  )
  const rawColors = Array.from(
    new Set(variants.map((v) => v.colorName)),
  ).filter((v) => v !== null)

  if (rawSizes.length === 0 || rawColors.length === 0) {
    return {}
  }

  const sizes = rawSizes.sort((a, b) => {
    const orderA = SIZE_ORDER[a.toLowerCase()] || 99
    const orderB = SIZE_ORDER[b.toLowerCase()] || 99
    return orderA - orderB
  })

  const colors = rawColors.sort((a, b) => a.localeCompare(b))

  const matrix: VariantMatrix = {}

  for (const size of sizes) {
    matrix[size] = {}
    for (const color of colors) {
      matrix[size][color] = {
        variantId: '',
        colorHex: '',
        isAvailable: false,
      }
    }
  }

  variants.forEach((variant) => {
    const size = variant.sizeName
    const color = variant.colorName
    if (size && color) {
      matrix[size][color] = {
        variantId: variant.id,
        colorHex: variant.colorHex || '#000',
        isAvailable: true,
      }
    }
  })

  return matrix
}
