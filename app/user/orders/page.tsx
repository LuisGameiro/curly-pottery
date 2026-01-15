import type { GetStaticPropsContext } from "next";
import { Bag } from "@components/icons";
import { Container, Text } from "@components/ui";
import { pagesData, siteInfo } from "app/api/fakeapi/data";
import { CarFront, ListOrderedIcon, ShoppingBag } from "lucide-react";


export default async function Orders() {
  return (
    <Container className="py-20 flex flex-col items-center justify-center ">
      <CarFront size={64} className="text-accent-4 mb-4" />
      <Text variant="heading">Your Orders are empty</Text>
    </Container>
  );
}


