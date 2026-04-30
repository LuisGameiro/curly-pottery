import { searchProducts } from 'actions/product.actions'
import { ProductCard } from '@components/product'
import { Text } from '@components/ui'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ''

  if (!query) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Text variant="bold" className="text-2xl">
          Search for something...
        </Text>
      </div>
    )
  }

  const result = await searchProducts(query)

  if (!result.success) throw new Error(result.message)

  const products = result.data || []

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Text variant="heading" className="text-3xl">
          Search Results for &quot;{query}&quot;
        </Text>
        <Text variant="muted" className="mt-2">
          Found {products.length} {products.length === 1 ? 'product' : 'products'}
        </Text>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <Text variant="bold" className="text-xl">
            No products found matching your search.
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="simple" />
          ))}
        </div>
      )}
    </div>
  )
}
