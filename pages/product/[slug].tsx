import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ProductView from '@components/product/ProductView/ProductView'
import { productsData, getSingleProductData } from 'api/fakeapi/data'
import Layout from '@components/common/Layout/Layout'
// Types for clarity
type Params = {
  slug: string
}

interface ProductPageProps {
  product: any | null
}
ProductPage

export default function ProductPage({ product })  {
  const router = useRouter()

  // Handle fallback state when fallback: 'blocking' is changed to true in the future
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  if (!product) {
    // This will trigger the 404 page if no product is found
    return <div>Product not found</div>
  }

  return (
    <>
      <Head>
        <title>{product.name} | Curly Pottery</title>
        <meta name="description" content={product.description || product.descriptionHtml?.replace(/<[^>]+>/g, '') || ''} />
      </Head>
      <ProductView product={product} relatedProducts={[]}  />
    </>
  )
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  // Build all product paths from the fake API data
  const slugs = productsData.products.map((p) => p.slug)

  const paths = slugs.map((slug) => ({ params: { slug } }))

  return {
    paths,
    fallback: false, // no other slugs than these at build time
  }
}

export const getStaticProps: GetStaticProps<ProductPageProps, Params> = async (ctx) => {
  const slug = ctx.params?.slug as string

  try {
    const { product } = getSingleProductData(slug)

    if (!product) {
      return { notFound: true }
    }

    return {
      props: {
        product,
      },
      revalidate: 60, // revalidate periodically in case data changes
    }
  } catch (e) {
    return { notFound: true }
  }
}
ProductPage.Layout = Layout
