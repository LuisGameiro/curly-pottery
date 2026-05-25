import constructMetadata from '@components/common/SEO/SEO'
import { Container, Text } from '@components/ui'
import { authOptions } from '@lib/auth/authOptions'
import { getFavouritesWithProductsAction } from 'actions/Favourite.actions'
import Loading from 'app/loading'
import { Heart } from 'lucide-react'
import { getServerSession } from 'next-auth'
import ProductCard from '@components/product/ProductCard/ProductCard'
import { Suspense } from 'react'
import { FAVOURITES_PAGE_SIZE } from '@lib/pagination'
import Link from 'next/link'

export const metadata = constructMetadata({
  title: 'Your Favourites',
  description:
    'View and manage your favourite handcrafted pottery pieces at Curly Pottery. Keep track of the items you love for a seamless shopping experience.',
})

export default async function FavouritesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>
}) {
  const { cursor } = await searchParams
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) {
    throw new Error('User not found')
  }

  const result = await getFavouritesWithProductsAction({
    cursor,
    take: FAVOURITES_PAGE_SIZE,
  })

  const { items: products, total, nextCursor, hasMore } = result

  if (products.length === 0 && !cursor) {
    return (
      <Container className="py-20 flex-center flex-col">
        <Heart size={64} className="text-muted mb-4" />
        <Text variant="heading">Your Favourites are empty</Text>
        <Text variant="subHeading" className="mt-2">
          Start adding some pieces you love!
        </Text>
      </Container>
    )
  }

  return (
    <Suspense fallback={<Loading />}>
      <Container>
        <header className="mb-8">
          <Text variant="heading">Favourites</Text>
          <Text variant="subHeading">
            Your saved handcrafted pottery pieces.
          </Text>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(
            (product: {
              id: string
              name: string
              slug: string
              description: string
              hide: boolean
              images: string[]
              requiresShipping: boolean
              createdAt: Date
              updatedAt: Date
              variants: Array<{
                id: string
                sku: string
                price: number
                currency: string
                stock: number
                availableForSale: boolean
                images: string[]
                sizeName: string
                colorName: string
                colorHex: string | null
                details: unknown
                discounts: unknown
                productId: string
                createdAt: Date
                updatedAt: Date
              }>
              categories: Array<{
                id: string
                name: string
                slug: string
                url: string | null
                image: string
                createdAt: Date
                updatedAt: Date
              }>
            }) => (
              <ProductCard key={product.id} product={product} />
            ),
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center py-6">
            <Link
              href={`/user/favourites?cursor=${encodeURIComponent(nextCursor!)}`}
              className="px-6 py-2 rounded-full border border-border hover:bg-accent-1 transition-colors"
            >
              Next page
            </Link>
          </div>
        )}

        {total > FAVOURITES_PAGE_SIZE && (
          <Text variant="muted" className="text-center py-4">
            Showing {products.length} of {total} favourites
          </Text>
        )}
      </Container>
    </Suspense>
  )
}
