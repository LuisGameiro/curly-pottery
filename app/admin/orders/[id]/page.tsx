import { Container, Text, Button } from "@components/ui";

import Image from "next/image";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { getOrderById, updateOrderStatus } from "actions/order.actions";

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;

  const order = await getOrderById(id);

  const handleStatusChange = async (newStatus: string) => {
    // setUpdating(true);
    // try {
    //   const result = await fetch(`/api/orders/${order.id}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ status: newStatus }),
    //   });
    //   if (!result.ok) alert("Failed to update status");
    //   router.replace(router.asPath); // Refresh data
    // } catch (error) {
    //   console.error("Failed to update status", error);
    // } finally {
    //   setUpdating(false);
    // }
  };

  // const handleStatusChange = async (newStatus:string) => {
  //   // No 'fetch' or 'axios' needed!
  //   // const result = await updateOrderStatus(order.id, newStatus);
  //   // if (result.success) {
  //   //   alert("Order updated!");
  //   // }
  // };

  const lineItems = order.lineItems as any[];
  const shipping = order.shippingAddress as any;
  const billing = order.billingAddress as any;

  return (
    <Container>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <Text variant="heading">
              Order #{order.id.slice(-6).toUpperCase()}
            </Text>
            <span className="text-sm bg-slate-100 px-3 py-1 rounded-full font-mono">
              {order.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-accent-2 p-3 rounded-xl border shadow-sm">
          <Text className="text-sm font-semibold">Status:</Text>
          <select
            className="bg-secondary text-sm font-medium rounded-lg px-3 py-2 outline-none border-none cursor-pointer"
            value={order.status}
            // disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Line Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-accent-2 border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-accent-2 flex items-center gap-2">
              <Package size={18} />
              <Text className="font-bold">Items Summary</Text>
            </div>
            <div className="divide-y">
              {lineItems.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Text className="font-medium text-sm">{item.name}</Text>
                    <Text className="text-xs text-muted-foreground font-mono">
                      {item.sku}
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text className="text-sm font-medium">
                      {order.currency} {item.price.toFixed(2)}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-accent-2 space-y-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {order.currency} {order.subtotalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Taxes {order.taxesIncluded && "(Included)"}
                </span>
                <span>{order.currency} 0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>
                  {order.currency} {order.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping Details */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-accent-2 border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <User size={18} />
              <Text className="font-bold text-sm">Customer</Text>
            </div>
            <div>
              <Text className="font-medium text-sm">
                {order.customer.firstName} {order.customer.lastName}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {order.customer.email}
              </Text>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-accent-2 border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <MapPin size={18} />
              <Text className="font-bold text-sm">Shipping Address</Text>
            </div>
            {shipping ? (
              <div className="text-sm space-y-1 text-muted-foreground">
                <p className="text-foreground font-medium">
                  {shipping.firstName} {shipping.lastName}
                </p>
                <p>{shipping.street}</p>
                <p>
                  {shipping.city}, {shipping.zipCode}
                </p>
                <p>{shipping.country}</p>
              </div>
            ) : (
              <Text className="text-sm italic text-muted-foreground">
                No shipping address provided.
              </Text>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-accent-2 border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <CreditCard size={18} />
              <Text className="font-bold text-sm">Payment Info</Text>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                Method
              </span>
              <span className="font-medium">Card (Visa)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                Date
              </span>
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
