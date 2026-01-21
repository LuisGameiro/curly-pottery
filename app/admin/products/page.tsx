import { Suspense } from "react";
import ProductsCLient from "../../../components/admin/ProductsClient";
import { getAllProducts } from "actions/product.actions";
import Loading from "app/loading";

export const metadata = {
  title: "Products - Curly Pottery",
  description: "Manage your store products at Curly Pottery.",
};

export default async function ProductsPage() {
  const response = await getAllProducts();

  if (!response.success) {
    throw new Error(response.message);
  }

  return (
    <Suspense fallback={<Loading />}>
      <ProductsCLient products={response.data || []} />;
    </Suspense>
  );
}
