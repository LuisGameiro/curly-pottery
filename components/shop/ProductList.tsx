import { ProductCard } from '@components/product'
import { SortLabels, sortProducts } from './sortProducts'
import { Text } from '@components/ui'

import { ProductWithVariantsCategories } from '@lib/types/types'

export default function ProductList({
  sortMethod,
  products,
}: {
  sortMethod: SortLabels
  products: ProductWithVariantsCategories[]
}) {
  if (products.length === 0) {
    return (
      <div className="py-10 text-center">
        <Text variant="bold">No products found!</Text>
      </div>
    )
  }

  const ProductsSort = sortProducts(products, sortMethod || 'newest')

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4">
        {ProductsSort.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="simple"
            priority={index < 3}
          />
        ))}
      </div>
    </div>
  )
}
