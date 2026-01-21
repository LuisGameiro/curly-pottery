import { Button, Container } from "@components/ui";
import { getAllCategories } from "actions/category.actions";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Text } from "@components/ui";
import CategoryTable from "@components/tables/CategoryTable";
import Loading from "app/loading";
import { Suspense } from "react";

export const metadata = {
  title: "Categories - Curly Pottery",
  description: "Manage your store product groupings at Curly Pottery.",
};

export default async function CategoriesPage() {
  const response = await getAllCategories();

  if (!response.success) {
    throw new Error(response.message);
  }

  return (
    <Suspense fallback={<Loading />}>
      <Container>
        <header>
          <div className="w-full flex flex-row justify-between">
            <Text variant="heading">Categories</Text>

            <Link href="/admin/categories/new" passHref>
              <Button variant="slim">
                <span className="mr-1">
                  <Plus size={18} />
                </span>
                <span>New Category</span>
              </Button>
            </Link>
          </div>
          <Text variant="subHeading">Manage your store product groupings.</Text>
        </header>

        <CategoryTable categories={response.data ?? []} />
      </Container>
    </Suspense>
  );
}
