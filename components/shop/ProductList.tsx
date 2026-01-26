import { ProductCard } from '@components/product'
import { SortLabels, sortProducts } from './sortProducts'
import { getProductsByCategorySlug } from 'actions/product.actions'
import { Text } from '@components/ui'

export default async function ShopClient({
  categorySlug,
  sortMethod,
}: {
  categorySlug: string | null
  sortMethod: SortLabels
}) {
  const products = await getProductsByCategorySlug(categorySlug)

  if (!products.success) throw new Error(products.message)

  if (!products.data || products.data.length === 0) {
    return (
      <div className="py-10 text-center">
        <Text variant="bold">No products found!</Text>
      </div>
    )
  }

  const ProductsSort = sortProducts(products.data || [], sortMethod || 'newest')

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 4xl:grid-cols-4">
      {ProductsSort.map((product) => (
        <ProductCard key={product.id} product={product} variant="simple" />
      ))}
    </div>
  )
}
