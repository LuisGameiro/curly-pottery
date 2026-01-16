import { Container, Text } from "@components/ui";
import { getAllOrders } from "actions/order.actions";
import { CheckCircle2, AlertCircle } from "lucide-react";
import OrderTable from "@components/common/Tables/OrderTable";

export default async function OrdersPage() {
  const orders = await getAllOrders();
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const otherOrders = orders.filter((o) => o.status !== "PENDING");

  return (
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
  );
}
