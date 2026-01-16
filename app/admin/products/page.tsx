import ProductsCLient from "./ProductsClient";
import { Container } from "@components/ui";
import { getAllProducts } from "actions/product.actions";

export const metadata = {
  title: "Admin - Products",
};

export default async function ProductsPage() {
  const products = await getAllProducts(); // Ensure this includes the 'variants' relation

  return <ProductsCLient products={products} />;
}
