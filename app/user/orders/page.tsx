import { Container, Text } from "@components/ui";
import { CarFront } from "lucide-react";

export const metadata = {
  title: "Your Orders - Curly Pottery",
  description:
    "View and manage your past orders at Curly Pottery. Keep track of your handcrafted pottery purchases and order history for a seamless shopping experience.",
};

export default async function Orders() {
  return (
    <Container className="py-20 flex flex-col items-center justify-center ">
      <CarFront size={64} className="text-accent-4 mb-4" />
      <Text variant="heading">Your Orders are empty</Text>
    </Container>
  );
}
