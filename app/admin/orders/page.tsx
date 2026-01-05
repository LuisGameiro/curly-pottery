import AdminLayout from "../layout";
import { Container, Text, Skeleton, Button } from "@components/ui";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { getAllOrders } from "actions/order.actions"; // You'll need to create this
import Link from "next/link";
import {
  Eye,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";

export default async function OrdersPage() {

  const orders = await getAllOrders();
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const otherOrders = orders.filter((o) => o.status !== "PENDING");

  const OrderTable = ({
    data,
    title,
    icon: Icon,
  }: {
    data: any[];
    title: string;
    icon: any;
  }) => (
    <div>
      <div className="flex items-center gap-3 w-full md:w-auto ">
        <Icon
          className={
            title === "Pending Orders" ? "text-amber-500" : "text-accent-8"
          }
          size={24}
        />
        <Text variant="sectionHeading" className="mt-2">
          {title} ({data.length})
        </Text>
      </div>

      <div className=" border-2 border-border rounded-xl shadow-sm">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {data.map((order) => (
              <tr key={order.id}>
                <td>#{order.id.slice(-6).toUpperCase()}</td>
                <td className="flex flex-col">
                  <span className="font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {order.customer.email}
                  </span>
                </td>
                <td className=" max-w-[200px] truncate text-sm">
                  {order.lineItems
                    .map((item: any) => item.quantity + "x " + item.sku)
                    .join(", ")}
                </td>
                <td>£{order.totalPrice.toFixed(0)}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="naked" title="View">
                      <Eye size={18} />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="py-10 text-center">
            No orders found in this category.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Container>
      <header>
        <div>
          <Text variant="heading">Order Management</Text>
          <Text variant="subHeading">
            Review and process your store transactions.
          </Text>
        </div>
      </header>

      <main>
        <OrderTable
          data={pendingOrders}
          title="Pending Orders"
          icon={AlertCircle}
        />

        <OrderTable
          data={otherOrders}
          title="Order History"
          icon={CheckCircle2}
        />
      </main>
    </Container>
  );
}

// Helper component for Status UI
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    PAID: "bg-blue-100 text-blue-700 border-blue-200",
    SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`text-sm font-bold px-1 rounded-full border ${styles[status] || styles.PENDING}`}
    >
      {status}
    </span>
  );
}

