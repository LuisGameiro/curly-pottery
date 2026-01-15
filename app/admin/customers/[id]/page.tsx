import { Container, Text, Button, Input } from "@components/ui";
import { getCustomerById, updateNotes } from "actions/customer.actions";
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

export default async function CustomerDetailsPage({ params }: { params: any }) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer || customer === null) {
    notFound();
  }
  const totalSpend = customer.orders.reduce(
    (acc: number, order: any) => acc + order.totalPrice,
    0
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
            {customer.name}
            {customer.fistName}
            {customer.lastName}
          </Text>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> Joined{" "}
              {new Date(customer.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="font-mono uppercase ">ID: {customer.id}</span>
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
              <Text>{customer.orders.length}</Text>
            </div>
            <div className="space-y-1 ">
              <Text className="uppercase font-bold tracking-tighter">
                Total Spend
              </Text>
              <Text>GBP {totalSpend.toFixed(2)}</Text>
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
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-muted-foreground" />
                <span>{customer.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {customer.acceptsMarketing ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-accent-3" />
                )}
                <span
                  className={
                    customer.acceptsMarketing
                      ? "text-green-700 font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {customer.acceptsMarketing
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
              {!customer?.addresses ? (
                <Text className="text-sm italic text-muted-foreground">
                  No saved addresses for this customer.
                </Text>
              ) : (
                customer.addresses.map((addr: any) => (
                  <div
                    key={addr.id}
                    className="text-sm p-3 rounded-lg border border-border"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-accent-4">
                        {addr.type}
                      </span>
                    </div>
                    <p className="font-medium">
                      {addr.firstName} {addr.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {addr.street}
                      <br />
                      {addr.city}, {addr.postalCode}
                      <br />
                      {addr.country}
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
            <OrderTable orders={customer.orders} />
          </Container>

          <Container variant="box" className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Notebook size={18} className="text-accent-6" />
              <Text variant="bold">Internal Notes</Text>
            </div>
            {/* <div className="p-4 rounded-xl text-sm italic">
              {customer.notes || "No internal notes for this customer."}
            </div> */}
            <CustomerNotes initialNotes={customer.notes} customerId={id} />
          </Container>
        </div>
      </div>
    </Container>
  );
}
