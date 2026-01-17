import { getCategoryById } from "actions/category.actions";
import CategoryClient from "./CategoryClient";
import notFound from "app/not-found";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isEditMode = id !== "new";

  let categoryData = null;

  if (isEditMode) {
    const response = await getCategoryById(id);
    if (!response.success) {
      throw new Error(response.message);
    }
    if (!response.data) {
      return notFound();
    }
    categoryData = response.data;
  }

  return <CategoryClient category={categoryData} isEditMode={isEditMode} />;
}
