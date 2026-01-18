"use client";

import Link from "next/link";
import { Eye, Mail, Phone } from "lucide-react";
import { Button } from "@components/ui";
import DataTable from "@components/ui/Table/DataTable";
import { Order, UserWithOrdersAddress } from "@lib/types/types";

export default function CustomerTable({
  customers,
}: {
  customers: UserWithOrdersAddress[];
}) {
  const customerColumns = [
    {
      header: "Customer",
      render: (user: UserWithOrdersAddress) => (
        <div>
          <div className="font-medium">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {user.id.slice(-6)}
          </div>
        </div>
      ),
    },
    {
      header: "Contacts",
      render: (user: UserWithOrdersAddress) => (
        <div className="flex flex-col gap-1 items-center">
          <div className="flex items-center gap-1.5">
            <Mail size={12} /> {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={12} /> {user.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Orders",
      align: "center" as const,
      render: (user: UserWithOrdersAddress) => user.orders?.length || 0,
    },
    {
      header: "Total Spend",
      render: (user: UserWithOrdersAddress) => {
        const total =
          user.orders?.reduce(
            (sum: number, o: Order) => sum + o.totalPrice,
            0,
          ) || 0;
        return `£${total.toLocaleString()}`;
      },
    },
    {
      header: "Actions",
      align: "center" as const,
      render: (user: UserWithOrdersAddress) => (
        <Link href={`/admin/customers/${user.id}`}>
          <Button variant="naked">
            <Eye size={20} />
          </Button>
        </Link>
      ),
    },
  ];

  return <DataTable data={customers} columns={customerColumns} />;
}
