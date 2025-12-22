import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'

import commerce from '@lib/api/commerce'
import { pagesData, productsData, siteInfo } from 'packages/fakeapi/data'

export async function getSearchStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  // const pagesPromise = commerce.getAllPages({ config, preview })
  // const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  // const { pages } = await pagesPromise
  // const { categories, brands } = await siteInfoPromise
  const { products } = productsData // This contains the array of 6 products
  const { pages } = pagesData // This contains the array of pages
  const { categories, brands } = siteInfo // These contain the categories and brands arrays

  return {
    props: {
      pages,
      categories,
      brands,
    },
    revalidate: 200,
  }
}

export type SearchPropsType = InferGetStaticPropsType<
  typeof getSearchStaticProps
>
