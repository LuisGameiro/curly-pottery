
import ProductsCLient from './ProductsClient';

import { Button, Container, Skeleton, Text, Input } from "@components/ui";
import { getAllProducts } from "actions/product.actions";



export const metadata = {
  title: "Admin - Products",
};

export default async function ProductsPage() {
  const products = await getAllProducts(); // Ensure this includes the 'variants' relation


  return (
    <Container>
      <ProductsCLient products={products}/>
    </Container>
  );
}

