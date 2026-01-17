import { Container, Text } from "@components/ui";
import { getUserById } from "actions/customer.actions";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Notebook,
} from "lucide-react";
import notFound from "app/not-found";
import OrderTable from "@components/common/Tables/OrderTable";
import CustomerNotes from "./CostumerNotes";
import { showCurrency } from "@lib/calculate-price";
import { Address, Order } from "@lib/types/types";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getUserById(id);

  if (!response.success) {
    throw new Error(response.message);
  }

  if (!response.data) {
    return notFound();
  }
  const user = response.data;

  const totalSpend = user!.orders.reduce(
    (acc: number, order: Order) => acc + order.totalPrice,
    0,
  );

  return (
    <Container>
      <header>
        <Link
          href="/admin/customers"
          className="flex items-center gap-2 text-muted-foreground hover:text-accent-6 mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Customers
        </Link>

        <div>
          <Text variant="heading">
            {user.firstName}
            {user.lastName}
          </Text>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> Joined{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="font-mono uppercase ">ID: {user.id}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Container variant="box" className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Text className="uppercase font-bold tracking-tighter">
                Orders
              </Text>
              <Text>{user.orders.length}</Text>
            </div>
            <div className="space-y-1 ">
              <Text className="uppercase font-bold tracking-tighter">
                Total Spend
              </Text>
              <Text>
                {showCurrency["GBP"]} {totalSpend.toFixed(2)}
              </Text>
            </div>
          </Container>

          <Container variant="box" className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <User size={18} className="text-accent-6" />
              <Text variant="bold">Contact Details</Text>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-muted-foreground" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-muted-foreground" />
                <span>{user.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {user.acceptsMarketing ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-accent-3" />
                )}
                <span
                  className={
                    user.acceptsMarketing
                      ? "text-green-700 font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {user.acceptsMarketing
                    ? "Subscribed to Marketing"
                    : "No Marketing"}
                </span>
              </div>
            </div>
          </Container>

          <Container variant="box" className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <MapPin size={18} className="text-accent-6" />
              <Text variant="bold">Saved Addresses</Text>
            </div>
            <div className="space-y-4">
              {!user?.addresses ? (
                <Text className="text-sm italic text-muted-foreground">
                  No saved addresses for this user.
                </Text>
              ) : (
                user.addresses.map((address: Address, i: number) => (
                  <div
                    key={address.id || i}
                    className="text-sm p-3 rounded-lg border border-border"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-accent-4">
                        {address.type}
                      </span>
                    </div>
                    <p className="font-medium">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {address.address}
                      <br />
                      {address.city}, {address.postalCode}
                      <br />
                      {address.country}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Container>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Container variant="box" className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <ShoppingBag size={18} className="text-accent-6" />
              <Text variant="bold">Order History</Text>
            </div>
            <OrderTable orders={user.orders} />
          </Container>

          <Container variant="box" className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Notebook size={18} className="text-accent-6" />
              <Text variant="bold">Internal Notes</Text>
            </div>
            <CustomerNotes initialNotes={user.notes || ""} customerId={id} />
          </Container>
        </div>
      </div>
    </Container>
  );
}
