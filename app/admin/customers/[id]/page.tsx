import { Container, Text, Button, Input } from "@components/ui";
import { getCustomerById } from "actions/customer.actions";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  XCircle,
  NotebookIcon,
  Notebook,
} from "lucide-react";
import notFound from "app/not-found";
import OrderTable from "@components/common/Tables/OrderTable";

export default async function CustomerDetailsPage({ params }: { params: any }) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) {
    notFound();
  }
  const totalSpend = customer.orders.reduce(
    (acc: number, order: any) => acc + order.totalPrice,
    0
  );

  return (
    <Container >
      <header >
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
            <span className="font-mono uppercase ">
              ID: {customer.id}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-accent-0 border rounded-2xl p-6 shadow-sm grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Text className="uppercase font-bold tracking-tighter">
                Orders
              </Text>
              <Text >
                {customer.orders.length}
              </Text>
            </div>
            <div className="space-y-1 ">
              <Text className="uppercase font-bold tracking-tighter">
                Total Spend
              </Text>
              <Text >
                GBP {totalSpend.toFixed(2)}
              </Text>
            </div>

          </div>

          <div className="bg-accent-0 border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <User size={18} className="text-accent-6" />
              <Text className="font-bold text-sm">Contact Details</Text>
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
                  <XCircle size={16} className="text-slate-300" />
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
          </div>

          <div className="bg-accent-0 border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <MapPin size={18} className="text-slate-400" />
              <Text className="font-bold text-sm">Saved Addresses</Text>
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
                    className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
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
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-accent-0 border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2  pb-3">

              <ShoppingBag size={18} className="text-slate-500" />
              <Text className="font-bold">Order History</Text>
            </div>
            <OrderTable orders={customer.orders} />

          </div>

          <div className="bg-accent-0 border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Notebook size={18} className="text-accent-6" />
              <Text className="font-bold mb-3 block text-sm">Internal Notes</Text>
            </div>
            <div className="p-4 rounded-xl text-sm italic">
              {customer.notes || "No internal notes for this customer."}
            </div>
            <Input placeholder="No internal notes for this customer" value={customer.notes ?? ''} />
          </div>
        </div>
      </div>
    </Container>
  );
}
