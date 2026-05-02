import constructMetadata from '@components/common/SEO'
import { ProductCard } from '@components/product'
import CategoriesCard from '@components/product/categoriesCard'
import { Grid, Marquee } from '@components/ui'
import { Product } from '@lib/types/types'
import { getAllCategories } from 'actions/category.actions'
import { getRandomProducts } from 'actions/product.actions'

export const metadata = constructMetadata({
  title: 'Handcrafted Pottery',
  description:
    'Discover unique, handcrafted pottery at Curly Pottery. Explore our collection of artisanal ceramics, perfect for adding a touch of elegance to your home or gifting to loved ones.',
  canonical: '/',
})

import HomeHero from '@components/ui/HomeHero/HomeHero'

export default async function Home() {
  const responseProducts = await getRandomProducts(13)
  const responseCategories = await getAllCategories()

  if (!responseProducts.success || !responseCategories.success)
    throw new Error(responseProducts.message + responseCategories.message)

  const products = responseProducts.data ?? []
  const categories = responseCategories.data ?? []

  return (
    <main className="flex flex-col  bg-linear-to-r from-background to-accent-2">
      <HomeHero />

      <div className="px-10 my-8">
        <h2 className="text-2xl font-bold mb-1">New in</h2>
        <p className="text-sm">Everything that&apos;s hot right now</p>
      </div>

      <Grid variant="filled" layout="B">
        {products.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="slim"
            imgProps={{
              alt: product.name,
              width: 1200,
              height: 1200,
              priority: true,
            }}
          />
        ))}
      </Grid>

      <div className="px-10 my-8">
        <h2 className="text-2xl font-bold mb-1">Explore Categories</h2>
        <p className="text-sm">Find the perfect piece for your home</p>
      </div>
      <Marquee>
        {categories.map((cat) => (
          <CategoriesCard key={cat.id} cat={cat} />
        ))}
      </Marquee>
    </main>
  )
}
