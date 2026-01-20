import OrderUserTable from "@components/tables/OrderUserTable";
import { Container, Text } from "@components/ui";
import { useUser } from "@lib/hooks/useUser";
import { getUserById } from "actions/customer.actions";
import Loading from "app/loading";
import { CarFront } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Your Orders - Curly Pottery",
  description:
    "View and manage your past orders at Curly Pottery. Keep track of your handcrafted pottery purchases and order history for a seamless shopping experience.",
};

export default async function Orders() {
  const { user } = useUser();

  if (!user) {
    throw new Error("User not found");
  }
  const response = await getUserById(user.id);

  if (!response.success) {
    throw new Error(response.message);
  }

  const orders = response.data?.orders;
  if (!orders)
    return (
      <Container className="py-20 flex flex-col items-center justify-center ">
        <CarFront size={64} className="text-accent-4 mb-4" />
        <Text variant="heading">Your Orders are empty</Text>
      </Container>
    );
  return (
    <Suspense fallback={<Loading />}>
      <Container>
        <header>
          <Text variant="heading">Orders</Text>
          <Text variant="subHeading">
            Review your orders and track their status.
          </Text>
        </header>

        <OrderUserTable orders={orders} />
      </Container>
    </Suspense>
  );
}
