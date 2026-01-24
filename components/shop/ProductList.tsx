import { ProductCard } from '@components/product'
import { SortLabels, sortProducts } from './sortProducts'
import { getProductsByCategorySlug } from 'actions/product.actions'

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
    return <p>No products found.</p>
  }

  const ProductsSort = sortProducts(products.data || [], sortMethod || 'newest')

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 ">
      {ProductsSort.map((product) => (
        <ProductCard key={product.id} product={product} variant="simple" />
      ))}
    </div>
  )
}
