import constructMetadata from '@components/common/SEO/SEO'
import { Container, Text } from '@components/ui'
import { authOptions } from '@lib/auth/authOptions'
import { getFavouritesWithProductsAction } from 'actions/Favourite.actions'
import Loading from 'app/loading'
import { Heart } from 'lucide-react'
import { getServerSession } from 'next-auth'
import ProductCard from '@components/product/ProductCard/ProductCard'
import { Suspense } from 'react'

export const metadata = constructMetadata({
  title: 'Your Favourites',
  description:
    'View and manage your favourite handcrafted pottery pieces at Curly Pottery. Keep track of the items you love for a seamless shopping experience.',
})

export default async function FavouritesPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) {
    throw new Error('User not found')
  }

  const products = await getFavouritesWithProductsAction()

  if (!products || products.length === 0) {
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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </Suspense>
  )
}