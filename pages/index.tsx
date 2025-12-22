import { Layout } from '@components/common'
import { ProductCard } from '@components/product'
import CategoriesCard from '@components/product/categoriesCard'
import { Grid, Marquee, Hero } from '@components/ui'
import { getAllCategories } from 'actions/category.actions'
import { getRandomProducts } from 'actions/product.actions'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'

export async function getStaticProps({
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const  products  = await getRandomProducts(5) // This contains the array of 6 products
  const  categories = await getAllCategories() // These contain the categories and brands arrays
  return {
    props: {
      products,
      categories
    },
    revalidate: 60,
  }
}

export default function Home({
  products, categories
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <main className="flex flex-col bg-accent-9">
      <Grid variant="filled" layout="A">
        {products.map((product: any, i: number) => (
          <ProductCard
            key={product.id}
            product={product}
            imgProps={{
              alt: product.name,
              width: i === 0 ? 1080 : 540,
              height: i === 0 ? 1080 : 540,
              priority: true,
              
            }}
          />
        ))}
      </Grid>

      <Hero
        headline="About Curly Pottery"
        description="We're dedicated to producing sustainable, artisanal pottery that celebrates the beauty of natural materials 
                    and traditional craftsmanship."
      />
    
      <Marquee variant="secondary">
        {categories.map((cat: any) => (
          <CategoriesCard key={cat.id} cat={cat} />
        ))}
      </Marquee>
    </main>
  )
}

Home.Layout = Layout

      {/* <HomeAllProductsGrid
        newestProducts={products}
        categories={categories}
        brands={brands}
      /> */}