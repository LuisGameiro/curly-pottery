import type { GetStaticPropsContext } from 'next'
import { Bag } from '@components/icons'
import { Layout } from '@components/common'
import { Container, Text } from '@components/ui'
import { pagesData, siteInfo } from 'api/fakeapi/data'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  // const pagesPromise = commerce.getAllPages({ config, preview })
  // const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  // const { pages } = await pagesPromise
  // const { categories } = await siteInfoPromise

  const { pages } = pagesData // This contains the array of pages
  const { categories, brands } = siteInfo // These contain the categories and brands arrays

  return {
    props: { pages, categories },
  }
}

export default function Orders() {
  return (
    <Container className="pt-4">
      <Text variant="pageHeading">My Orders</Text>
      <div className="flex-1 p-24 flex flex-col justify-center items-center ">
        <span className="border border-dashed border-secondary rounded-full flex items-center justify-center w-16 h-16 p-12 bg-primary text-primary">
          <Bag className="absolute" />
        </span>
        <h2 className="pt-6 text-2xl font-bold tracking-wide text-center">
          No orders found
        </h2>
        <p className="text-accent-6 px-10 text-center pt-2">
          Biscuit oat cake wafer icing ice cream tiramisu pudding cupcake.
        </p>
      </div>
    </Container>
  )
}

Orders.Layout = Layout
