import type { GetStaticPropsContext } from "next";
// import commerce from '@lib/api/commerce'
import { Layout } from "@components/common";
import { Text } from "@components/ui";
import { productsData, pagesData, siteInfo } from "app/api/fakeapi/data";

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales };
  // const { pages } = await commerce.getAllPages({ config, preview })
  // const { categories, brands } = await commerce.getSiteInfo({ config, preview })
  const { products } = productsData; // This contains the array of 6 products
  const { pages } = pagesData; // This contains the array of pages
  const { categories, brands } = siteInfo; // These contain the categories and brands arrays

  return {
    props: {
      pages,
      categories,
      brands,
    },
    revalidate: 200,
  };
}

export default function NotFound() {
  return (
    <div className="max-w-2xl min-h-full  mx-8 sm:mx-auto py-30 flex flex-col items-center justify-center">
      <Text variant="heading">Not Found</Text>
      <Text variant="body">
        The requested page doesn't exist or you don't have access to it.
      </Text>
    </div>
  );
}

NotFound.Layout = Layout;
