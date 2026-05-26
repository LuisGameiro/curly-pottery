import { searchProducts } from '@actions/product.actions'
import { ProductCard } from '@components/product'
import { Text } from '@components/ui'
import { SEARCH_PAGE_SIZE } from '@lib/pagination'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string; cursor?: string }>
}>) {
  const { q, cursor } = await searchParams
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

  const result = await searchProducts(query, { cursor, take: SEARCH_PAGE_SIZE })

  if (!result.success) throw new Error(result.message)

  const { items: products, total, nextCursor, hasMore } = result.data!

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Text variant="heading" className="text-3xl">
          Search Results for &quot;{query}&quot;
        </Text>
        <Text variant="muted" className="mt-2">
          Found {total} {total === 1 ? 'product' : 'products'}
        </Text>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <Text variant="bold" className="text-xl">
            No products found matching your search.
          </Text>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="simple"
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center py-8">
              <Link
                href={`/search?q=${encodeURIComponent(query)}&cursor=${encodeURIComponent(nextCursor!)}`}
                className="px-6 py-2 rounded-full border border-border hover:bg-accent-1 transition-colors"
              >
                Next page
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
