import { ProductWithVariantsCategories, Variant } from '@lib/types/types'

export const sortLabels: Record<string, string> = {
  newest: 'Newest first',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'name-asc': 'Alphabetically: A-Z',
  'name-desc': 'Alphabetically: Z-A',
  availability: 'Availability (In Stock)',
}

export type SortLabels = keyof typeof sortLabels

export const sortProducts = (
  products: ProductWithVariantsCategories[],
  sortMethod: SortLabels,
) => {
  if (!Array.isArray(products)) return []

  const list = [...products]

  switch (sortMethod) {
    case 'availability':
      return list.sort((a, b) => {
        const aStock = a.variants.reduce((acc, v) => acc + v.stock, 0)
        const bStock = b.variants.reduce((acc, v) => acc + v.stock, 0)
        if (aStock > 0 && bStock === 0) return -1
        if (aStock === 0 && bStock > 0) return 1
        return 0
      })
    case 'price-asc':
      return list.sort(
        (a, b) =>
          Math.min(...a.variants.map((v: Variant) => v.price)) -
          Math.min(...b.variants.map((v: Variant) => v.price)),
      )
    case 'price-desc':
      return list.sort(
        (a, b) =>
          Math.max(...b.variants.map((v: Variant) => v.price)) -
          Math.max(...a.variants.map((v: Variant) => v.price)),
      )
    case 'name-asc':
      return list.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return list.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }
}
