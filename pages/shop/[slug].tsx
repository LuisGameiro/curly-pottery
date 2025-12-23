import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import ProductView from "@components/product/ProductView/ProductView";
import { productsData, getSingleProductData } from "api/fakeapi/data";
import Layout from "@components/common/Layout/Layout";
import { Product } from "@lib/types/product";
import { getAllProducts, getProductBySlug } from "actions/product.actions";

type Params = {
  slug: string;
};

interface ProductPageProps {
  product: Product;
}
export default function AdminCategories({ product }: ProductPageProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <Head>
        <title>{product.name} | Curly Pottery</title>
        <meta name="description" content={product.description || ""} />
      </Head>
      <ProductView product={product} />
    </>
  );
}

export async function getStaticPaths() {
  const products = await getAllProducts();

  return {
    paths: products.map((product) => ({
      params: { slug: product.slug },
    })),
    fallback: "blocking",
  };
}
export async function getStaticProps({ params }: { params: Params }) {
  const { slug } = params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      product,
    },
    revalidate: 60,
  };
}

ProductPage.Layout = Layout;
