'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@components/ui'
import DataTable from '@components/ui/Table/DataTable'
import { CartLineItem, Order } from '@lib/types/types'

export default function OrderTable({ orders }: { orders: Order[] }) {
  const orderColumns = [
    {
      header: 'Order ID',
      render: (o: Order) => `#${o.id.slice(-6).toUpperCase()}`,
    },
    {
      header: 'Customer',
      render: (o: Order) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {o.firstName} {o.lastName}
          </span>
          <span className="text-xs opacity-70">{o.email}</span>
        </div>
      ),
    },
    {
      header: 'Items',
      render: (o: Order) => {
        return (
          <div className="max-w-[150px] truncate">
            {((o?.lineItems as CartLineItem[]) || [])
              .map((i: CartLineItem) => `${i.quantity}x ${i.sku}`)
              .join(', ')}
          </div>
        )
      },
    },
    { header: 'Total', render: (o: Order) => `£${o.totalPrice.toFixed(2)}` },
    {
      header: 'Status',
      render: (o: Order) => <StatusBadge status={o.status} />,
    },
    {
      header: 'View',
      align: 'center' as const,
      render: (o: Order) => (
        <Link href={`/admin/orders/${o.id}`}>
          <Button variant="naked">
            <Eye size={18} />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <DataTable
      data={orders}
      columns={orderColumns}
      emptyMessage="No orders found"
    />
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    PAID: 'bg-blue-100 text-blue-700 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <span
      className={`text-sm font-bold px-1 rounded-full border ${styles[status] || styles.PENDING}`}
    >
      {status}
    </span>
  )
}
