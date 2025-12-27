import AdminLayout from "../layout";
import { Container, Text, Button } from "@components/ui";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getCustomerById } from "actions/customer.actions"; // Ensure this includes orders & addresses
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
} from "lucide-react";

async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const customer = await getCustomerById(params?.id as string);
  if (!customer) return { notFound: true };

  return { props: { customer } };
}

export default function CustomerDetailsPage({
  customer,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const totalSpend = customer.orders.reduce(
    (acc: number, order: any) => acc + order.totalPrice,
    0,
  );

  return (
    <Container className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <Link
          href="/admin/customers"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </div>
            <div>
              <Text variant="heading">
                {customer.firstName} {customer.lastName}
              </Text>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> Joined{" "}
                  {new Date(customer.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="font-mono uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                  ID: {customer.id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="text-xs">Edit Customer</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Contact */}
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Text className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">
                Total Spend
              </Text>
              <Text className="text-xl font-black">
                GBP {totalSpend.toFixed(2)}
              </Text>
            </div>
            <div className="space-y-1">
              <Text className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">
                Orders
              </Text>
              <Text className="text-xl font-black">
                {customer.orders.length}
              </Text>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <User size={18} className="text-slate-400" />
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

          {/* Saved Addresses */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
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
                      {addr.streetNumber} {addr.apartments}
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

        {/* Right Column: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-slate-500" />
                <Text className="font-bold">Order History</Text>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs font-semibold uppercase text-muted-foreground">
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customer.orders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-blue-600 hover:underline"
                        >
                          #{order.id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            order.status === "COMPLETED"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : order.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-slate-50 text-slate-700 border-slate-100"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {order.currency} {order.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {customer.orders.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-muted-foreground"
                      >
                        This customer hasn't placed any orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <Text className="font-bold mb-3 block text-sm">Internal Notes</Text>
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-sm text-amber-900 italic">
              {customer.notes || "No internal notes for this customer."}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

CustomerDetailsPage.Layout = AdminLayout;
