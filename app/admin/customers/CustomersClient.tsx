'use client'

import { Container, Text, Skeleton, Input, Button } from "@components/ui";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  ShoppingBag,
  Search,
  ExternalLink,
  MailCheck,
  MailX,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";
import AdminLayout from "pagesx/admin/layout";
import { getAllCustomers } from "actions/customer.actions";



export default async function CustomersClient({ customers }) {


  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [customers, searchTerm]);

  return (
    <Container>
      <header>
        <div>
          <Text variant="heading">Customers</Text>
          <Text variant="subHeading">
            View and manage your customer relationships.
          </Text>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e)}
          />
        </div>
      </header>

      <main>
        {filteredCustomers.length > 0 ? (
          <div className=" border-2 border-border rounded-xl overflow-scroll shadow-sm">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contacts</th>
                  <th>Orders</th>
                  <th>Total Spend</th>
                  <th>Marketing</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-center">
                {filteredCustomers.map((customer) => {
                  const totalSpend =
                    customer.orders?.reduce(
                      (sum: number, order: any) => sum + order.totalPrice,
                      0,
                    ) || 0;
                  const orderCount = customer.orders?.length || 0;

                  return (
                    <tr key={customer.id}>
                      <td className="items-center gap-1">
                        <Text>
                          {customer.firstName} {customer.lastName}
                        </Text>
                        <Text>ID: {customer.id.slice(-6)}</Text>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 min-w-0 justify-center">
                          <Mail size={12} className="shrink-0" />
                          <span className="break-all whitespace-normal">
                            {customer.email}
                          </span>
                        </div>

                        {customer.phone && (
                          <div className="flex items-center gap-1.5 ">
                            <Phone size={12} className="shrink-0" />
                            <span className="break-all whitespace-normal">
                              {customer.email}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{orderCount}</div>
                      </td>
                      <td>
                        £
                        {totalSpend.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                        })}
                      </td>
                      <td>
                        <div
                          className="flex justify-center"
                          title={
                            customer.acceptsMarketing
                              ? "Subscribed to Marketing"
                              : "Not Subscribed"
                          }
                        >
                          <MailCheck
                            className={
                              customer.acceptsMarketing
                                ? "text-green-500"
                                : "text-accent-2"
                            }
                            size={18}
                          />
                        </div>
                      </td>
                      <td>
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button variant="naked" title="View">
                            <Eye size={18} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <User className="mx-auto" size={48} />
            <Text>No customers found matching your search.</Text>
          </div>
        )}
      </main>
    </Container>
  );
}

