// import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { ProductCard } from '@components/product'
import { Grid, Marquee, Hero } from '@components/ui'
import { pagesData, productsData, siteInfo } from 'api/fakeapi/data'
// import HomeAllProductsGrid from '@components/common/HomeAllProductsGrid'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  // const productsPromise = commerce.getAllProducts({
  //   variables: { first: 6 },
  //   config,
  //   preview,
  //   // Saleor provider only
  //   ...({ featured: true } as any),
  // })
  // const pagesPromise = commerce.getAllPages({ config, preview })
  // const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  // const { products } =  await productsPromise
  // const { pages } = await pagesPromise
  // const { categories, brands } = await siteInfoPromise
  const { products } = productsData // This contains the array of 6 products
  const { pages } = pagesData // This contains the array of pages
  const { categories, brands } = siteInfo // These contain the categories and brands arrays
  return {
    props: {
      products,
      categories,
      brands,
      pages,
    },
    revalidate: 60,
  }
}

export default function Home({
  products,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <main className='md:max-w-8/12 lg:max-w-7/12 mx-auto'>
      <Grid variant="filled" >
        {products.slice(0, 3).map((product: any, i: number) => (
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
      <Marquee variant="secondary">
        {products.slice(6, 12).map((product: any, i: number) => (
          <ProductCard key={product.id} product={product} variant="slim" />
        ))}
      </Marquee>
      <Hero
        headline="About Curly Pottery"
        description="We're dedicated to producing sustainable, artisanal pottery that celebrates the beauty of natural materials 
                            and traditional craftsmanship."
      />
    
      {/* <HomeAllProductsGrid
        newestProducts={products}
        categories={categories}
        brands={brands}
      /> */}
    </main>
  )
}

Home.Layout = Layout
