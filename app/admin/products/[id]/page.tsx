import { getProductById } from "actions/product.actions";
import { getAllCategories } from "actions/category.actions";
import ProductClient from "./ProductClient";
import notFound from "app/not-found";
import { Category, Product, ProductWithVariantsCategories } from "@lib/types/types";

export const metadata = {
  title: "Product - Curly Pottery",
  description: "Manage your store product at Curly Pottery.",
};

export default async function ProductForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isEditMode = id !== "new";

  let productData: ProductWithVariantsCategories | null = null;
  let categoriesData: Category[] = [];

  if (isEditMode) {
    const responseProduct = await getProductById(id as string);
    const responseCategories = await getAllCategories();

    if (!responseProduct.success || !responseCategories.success) {
      throw new Error(responseProduct.message + responseCategories.success);
    }

    if (!responseProduct.data) {
      return notFound();
    }
    productData = responseProduct.data;
    categoriesData = responseCategories.data;
  }

  return (
    <ProductClient
      isEditMode={isEditMode}
      initialData={productData}
      categories={categoriesData}
    />
  );
}
