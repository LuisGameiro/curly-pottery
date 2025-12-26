import AdminLayout from "../layout";
import { Container, Text, Skeleton } from "@components/ui";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { getAllOrders } from "actions/order.actions"; // You'll need to create this
import Link from "next/link";
import { Eye, Clock, CheckCircle2, Package, Truck, AlertCircle } from "lucide-react";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const orders = await getAllOrders();
  return {
    props: { orders },
    revalidate: 30, // Orders change frequently
  };
}

export default function OrdersPage({ orders }: InferGetStaticPropsType<typeof getStaticProps>) {
  
  // Separate orders by status
  const pendingOrders = orders.filter(o => o.status === "PENDING");
  const otherOrders = orders.filter(o => o.status !== "PENDING");

  const OrderTable = ({ data, title, icon: Icon }: { data: any[], title: string, icon: any }) => (
    <div className="flex flex-col gap-4"> 
      <div className="flex items-center gap-2 px-2">
        <Icon className={title === "Pending Orders" ? "text-amber-500" : "text-slate-400"} size={20} />
        <Text variant="heading" >{title} ({data.length})</Text>
      </div>
      
      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-slate-500">#{order.id.slice(-6).toUpperCase()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{order.customer.firstName} {order.customer.lastName}</span>
                    <span className="text-xs text-muted-foreground">{order.customer.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs max-w-[200px] truncate">
                    {/* Assuming lineItems is an array inside the JSON */}
                    {order.lineItems.map((item: any) => item.quantity + 'x ' + item.sku).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-sm">
                    {order.currency} {order.totalPrice.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/orders/${order.id}`}>
                    <button className="p-2 hover:bg-secondary rounded-full transition">
                      <Eye size={18} />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="py-10 text-center text-muted-foreground text-sm">
            No orders found in this category.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Container className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-12">
        <header>
          <Text variant="heading">Order Management</Text>
          <Text>Review and process your store transactions.</Text>
        </header>

        {/* Top Section: Pending */}
        <OrderTable 
            data={pendingOrders} 
            title="Pending Orders" 
            icon={AlertCircle} 
        />

        {/* Bottom Section: Everything Else */}
        <OrderTable 
            data={otherOrders} 
            title="Order History" 
            icon={CheckCircle2} 
        />
      </div>
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
    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}

OrdersPage.Layout = AdminLayout;