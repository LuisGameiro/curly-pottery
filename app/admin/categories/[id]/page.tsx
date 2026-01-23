import { getCategoryById } from "actions/category.actions";
import CategoryClient from "../../../../components/admin/CategoryClient";
import notFound from "app/not-found";
import constructMetadata from "@components/common/SEO/SEO";

export const metadata = constructMetadata({
  title: "Category Admin",
  description: "Manage your store category at Curly Pottery.",
});

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
