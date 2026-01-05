import { getCategoryById } from "actions/category.actions";
import CategoryClient from "./CategoryClient";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isEditMode = !!id && id !== "new";

  const category = isEditMode ?  await getCategoryById(id) : {}


  return (
    <CategoryClient category={category} isEditMode={isEditMode} />

  );
}