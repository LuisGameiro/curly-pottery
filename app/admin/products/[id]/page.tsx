import { getProductById } from "actions/product.actions";
import { getAllCategories } from "actions/category.actions";
import ProductClient from "./ProductClient";
import notFound from "app/not-found";

export default async function ProductForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const responseProduct = await getProductById(id as string);
  const responseCategories = await getAllCategories();

  if (!responseProduct.success || !responseCategories.success) {
    throw new Error(responseProduct.message + responseCategories.success);
  }

  if (!responseProduct.data) {
    return notFound();
  }

  return (
    <ProductClient
      initialData={responseProduct.data}
      categories={responseCategories.data || []}
    />
  );
}
