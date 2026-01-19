import { Container, Text } from "@components/ui";
import Image from "next/image";
import { ArrowLeft, Package, MapPin, User } from "lucide-react";
import Link from "next/link";
import { getOrderById } from "actions/order.actions";
import OrderStatusUpdate from "./orderStatusUpdate";
import { showCurrency } from "@lib/calculate-price";
import { Address, CartLineItem, Order } from "@lib/types/types";
import notFound from "app/not-found";
import Loading from "app/loading";
import { Suspense } from "react";

export const metadata = {
  title: 'Order - Curly Pottery',
  description: 'Manage your store order at Curly Pottery.',
};

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await getOrderById(id);
  if (!response.success) {
    throw new Error(response.message);
  }

  if (!response.data) {
    return notFound();
  }

  const lineItems = response.data.lineItems as CartLineItem[];
  const address = response.data.shippingAddress as unknown as Address;
  const user = response.data.user;

  const order = response.data as Order;

  return (
    <Suspense fallback={<Loading />}>
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
              <span className="text-sm bg-accent-1 px-3 py-1 rounded-full font-mono">
                {order.id}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-2">
            <Container variant="box" className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Package size={18} className="text-accent-6" />
                <Text variant="bold">Items Summary</Text>
              </div>
              <div className="divide-y">
                {lineItems.map((item: CartLineItem) => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border shrink-0">
                      <Image
                        src={item.images[0]}
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
                        {showCurrency[order.currency]}{" "}
                        {Number(item.price).toFixed(2)}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 space-y-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {showCurrency[order.currency]}{" "}
                    {order.subtotalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Shipping {order.taxesIncluded && "(Included)"}
                  </span>
                  <span>
                    {showCurrency[order.currency]}{" "}
                    {Number(order.shippingPrice).toFixed(2) || 0.0}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>
                    {showCurrency[order.currency]} {order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </Container>
          </div>

          {/* Right Column: Customer & Shipping Details */}
          <div className="space-y-6">
            <OrderStatusUpdate
              orderId={order.id}
              currentStatus={order.status}
            />

            <Container variant="box" className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <User size={18} className="text-accent-6" />
                <Text variant="bold">Customer</Text>
              </div>
              <div>
                <Text>
                  {user?.firstName || order?.firstName}{" "}
                  {user?.lastName || order?.lastName}
                </Text>
                <Text>{order.email}</Text>
                <Text>{order.phone}</Text>
              </div>
            </Container>

            <Container variant="box" className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <MapPin size={18} className="text-accent-6" />
                <Text variant="bold">Shipping Address</Text>
              </div>
              {address ? (
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                </div>
              ) : (
                <Text>No shipping address provided.</Text>
              )}
            </Container>
          </div>
        </div>
      </Container>
    </Suspense>
  );
}
