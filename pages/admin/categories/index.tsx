// app/admin/categories/page.tsx
// import { getAllCategories } from "actions/category.actions";
// import CategoryTable from "./CategoryTable";
// import { categories } from "api/fakeapi/seedData";
import CategoriesCard from "@components/product/categoriesCard";
import AdminLayout from "../products/layout";
import { Container, Skeleton } from "@components/ui";
import products from "../products";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { getAllCategories } from "actions/category.actions";

export const dynamic = "force-dynamic"; // Ensures data is always fresh

export async function getStaticProps({
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales };
  const categories = await getAllCategories();

  return {
    props: {
      categories,
    },
    revalidate: 300,
  };
}


export default async function CategoriesPage({ categories }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <main className="lg:col-span-9">
          {products.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3  gap-2 sm:gap-6">
              {categories.map((cat) => (
                <CategoriesCard key={cat.id} cat={cat}
                  imgProps={{
                    width: 480,
                    height: 480,
                    alt: cat.name,
                  }} />

              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i}>
                  <div className="w-full h-64" />
                </Skeleton>
              ))}
            </div>
          )}
        </main>
      </div>
    </Container>
  );
}

CategoriesPage.Layout = AdminLayout;