import { Container, Text, Skeleton, Input } from "@components/ui";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { User, Mail, Phone, ShoppingBag, Search, ExternalLink, MailCheck, MailX } from "lucide-react";
import { useState, useMemo } from "react";
import AdminLayout from "pages/admin/layout";
import { getAllCustomers } from "actions/customer.actions";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const customers = await getAllCustomers(); // Ensure this includes the 'orders' relation
  return {
    props: { customers },
    revalidate: 60,
  };
}

export default function CustomersPage({ customers }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  return (
    <Container className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <Text variant='heading'>Customers</Text>
            <Text>View and manage your customer relationships.</Text>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <main>
          {filteredCustomers.length > 0 ? (
            <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Contact Info</th>
                    <th className="px-6 py-4 font-semibold text-center">Orders</th>
                    <th className="px-6 py-4 font-semibold">Total Spend</th>
                    <th className="px-6 py-4 font-semibold text-center">Marketing</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.map((customer) => {
                    const totalSpend = customer.orders?.reduce((sum: number, order: any) => sum + order.totalPrice, 0) || 0;
                    const orderCount = customer.orders?.length || 0;

                    return (
                      <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold border">
                              {customer.firstName[0]}{customer.lastName[0]}
                            </div>
                            <div>
                              <Text className="font-bold text-sm">{customer.firstName} {customer.lastName}</Text>
                              <Text className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">ID: {customer.id.slice(-6)}</Text>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail size={12} /> {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone size={12} /> {customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                            <ShoppingBag size={12} /> {orderCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-sm">
                          GBP {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {customer.acceptsMarketing ? (
                            <div className="flex justify-center" title="Subscribed to Marketing">
                              <MailCheck className="text-green-500" size={18} />
                            </div>
                          ) : (
                            <div className="flex justify-center" title="Not Subscribed">
                              <MailX className="text-slate-300" size={18} />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/customers/${customer.id}`}>
                            <button className="p-2 hover:bg-secondary rounded-lg transition-colors border shadow-sm flex items-center gap-2 text-xs font-medium ml-auto">
                              Details <ExternalLink size={14} />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <User className="mx-auto text-slate-300 mb-4" size={48} />
              <Text className="font-medium text-slate-500">No customers found matching your search.</Text>
            </div>
          )}
        </main>
      </div>
    </Container>
  );
}

CustomersPage.Layout = AdminLayout;