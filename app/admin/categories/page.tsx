import { Button, Container, Skeleton } from "@components/ui";
import { deleteCategory, getAllCategories } from "actions/category.actions";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Text } from "@components/ui";
import CategoryTable from "./CategoriesTable";

export default async function CategoriesPage() {

  const categories = await getAllCategories();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    //const response = await deleteCategory(id)

    // console.log("Delete Result:", response);

  };

  return (
    <Container>
      <header>
        <div>
          <Text variant="heading">Categories</Text>
          <Text variant="subHeading">Manage your store product groupings.</Text>
        </div>

        <Link href="/admin/categories/new" passHref>
          <Button variant="secondary">
            <Plus size={18} /> New Category
          </Button>
        </Link>
      </header>

      <CategoryTable categories={categories}/>
    </Container>
  );
}
