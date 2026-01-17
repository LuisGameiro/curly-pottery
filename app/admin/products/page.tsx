import { Suspense } from "react";
import ProductsCLient from "./ProductsClient";
import { getAllProducts } from "actions/product.actions";
import Loading from "app/loading";

export const metadata = {
  title: "Admin - Products",
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
