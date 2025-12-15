import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
import { useRouter } from 'next/router'
// import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { ProductView } from '@components/product'
import commerce from '@lib/api/commerce'
import { getSingleProductData, productsData, pagesData, siteInfo, relatedProductsData } from 'packages/fakeapi/data'

export async function getStaticProps({
  params,
  locale,
  locales,
  preview,
}: GetStaticPropsContext<{ slug: string }>) {
  const config = { locale, locales }
  // const pagesPromise = commerce.getAllPages({ config, preview })
  // const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  // const productPromise = commerce.getProduct({
  //   variables: { slug: params!.slug },
  //   config,
  //   preview,
  // })
  // const allProductsPromise = commerce.getAllProducts({
  //   variables: { first: 4 },
  //   config,
  //   preview,
  // })
  // const { pages } = await pagesPromise
  // const { categories } = await siteInfoPromise
  // const { product } = await productPromise
  // const { products: relatedProducts } = await allProductsPromise

  const productSlug = params!.slug || 'test-product-1';
  const { product } = getSingleProductData(productSlug);
  const { products: relatedProducts } = relatedProductsData;
  const { products } = productsData // This contains the array of 6 products
  const { pages } = pagesData // This contains the array of pages
  const { categories, brands } = siteInfo // These contain the categories and brands arrays
  if (!product) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      pages,
      product,
      relatedProducts,
      categories,
    },
    revalidate: 200,
  }
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const { products } = await commerce.getAllProductPaths()

  return {
    paths: locales
      ? locales.reduce<string[]>((arr, locale) => {
          // Add a product path for every locale
          products.forEach((product: any) => {
            arr.push(`/${locale}/product${product.path}`)
          })
          return arr
        }, [])
      : products.map((product: any) => `/product${product.path}`),
    fallback: 'blocking',
  }
}

export default function Slug({
  product,
  relatedProducts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()

  return router.isFallback ? (
    <h1>Loading...</h1>
  ) : (
    <ProductView product={product} relatedProducts={relatedProducts} />
  )
}

Slug.Layout = Layout
