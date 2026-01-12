import { Button, Container } from "@components/ui";
import {  getAllCategories } from "actions/category.actions";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Text } from "@components/ui";
import CategoryTable from "@components/common/Tables/CategoryTable";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <Container>
      <header>
        <div className="w-full flex flex-row justify-between">
          <Text variant="heading">Categories</Text>
          <Link href="/admin/categories/new" passHref >
            <Button variant='slim'>
              <span className="mr-1"><Plus size={18} /></span>
              <span>New Category</span>
            </Button>
          </Link>
        </div>
        <Text variant="subHeading">Manage your store product groupings.</Text>
      </header>

      <CategoryTable categories={categories} />
    </Container>
  );
}
