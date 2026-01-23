import { Container, Text } from "@components/ui";
import { getAllOrders } from "actions/order.actions";
import { CheckCircle2, AlertCircle } from "lucide-react";
import OrderTable from "@components/tables/OrderTable";
import Loading from "app/loading";
import { Suspense } from "react";
import constructMetadata from "@components/common/SEO";

export const metadata = constructMetadata({
  title: "Orders Admin",
  description: "Manage your store orders at Curly Pottery.",
});

export default async function OrdersPage() {
  const response = await getAllOrders();

  if (!response.success) {
    throw new Error(response.message);
  }

  const orders = response.data ?? [];
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const otherOrders = orders.filter((o) => o.status !== "PENDING");

  return (
    <Suspense fallback={<Loading />}>
      <Container>
        <header>
          <Text variant="heading">Order Management</Text>
          <Text variant="subHeading">
            Review and process your store transactions.
          </Text>
        </header>

        <main>
          <div className="flex items-center gap-3 w-full md:w-auto ">
            <AlertCircle size={24} />
            <Text variant="sectionHeading" className="mt-2">
              Pending Orders ({pendingOrders.length})
            </Text>
          </div>
          <OrderTable orders={pendingOrders} />

          <div className="flex items-center gap-3 w-full md:w-auto ">
            <CheckCircle2 size={24} />
            <Text variant="sectionHeading" className="mt-2">
              Order History ({otherOrders.length})
            </Text>
          </div>
          <OrderTable orders={otherOrders} />
        </main>
      </Container>
    </Suspense>
  );
}
