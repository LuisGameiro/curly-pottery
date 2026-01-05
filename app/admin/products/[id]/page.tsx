import { getProductById } from "actions/product.actions";

import { getAllCategories } from "actions/category.actions";

import ProductClient from "./ProductClient";

interface ProductFormProps {
  initialData?: any;
  categories: any[];
}

export default async function ProductForm({ params }) {
  const { id } = await params;
  const product = await getProductById(id as string);
  const categories = await getAllCategories();

  return <ProductClient initialData={product} categories={categories} />;
}
