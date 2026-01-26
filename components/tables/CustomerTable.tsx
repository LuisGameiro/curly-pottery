'use client'

import Link from 'next/link'
import { Eye, Mail, Phone } from 'lucide-react'
import { Button } from '@components/ui'
import DataTable from '@components/ui/Table/DataTable'
import { Order, UserWithOrders } from '@lib/types/types'

export default function CustomerTable({
  customers,
}: {
  customers: UserWithOrders[]
}) {
  const customerColumns = [
    {
      header: 'Customer',
      render: (user: UserWithOrders) => (
        <div>
          <div className="font-medium">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-muted">ID: {user.id.slice(-6)}</div>
        </div>
      ),
    },
    {
      header: 'Contacts',
      render: (user: UserWithOrders) => (
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2.5">
            <Mail size={12} /> {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-2.5">
              <Phone size={12} /> {user.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Orders',
      align: 'center' as const,
      render: (user: UserWithOrders) => user.orders?.length || 0,
    },
    {
      header: 'Total Spend',
      render: (user: UserWithOrders) => {
        const total =
          user.orders?.reduce(
            (sum: number, o: Order) => sum + o.totalPrice,
            0,
          ) || 0
        return `£${total.toLocaleString()}`
      },
    },
    {
      header: 'Actions',
      align: 'center' as const,
      render: (user: UserWithOrders) => (
        <Link href={`/admin/customers/${user.id}`}>
          <Button variant="naked">
            <Eye size={20} />
          </Button>
        </Link>
      ),
    },
  ]

  return <DataTable data={customers} columns={customerColumns} />
}
