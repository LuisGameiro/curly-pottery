'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@components/ui'
import DataTable from '@components/ui/Table/DataTable'
import { CartLineItem, Order, OrderWithUser } from '@lib/types/types'
import { StatusBadge } from '@components/admin/StatusBadge'

export default function OrderTable({ orders }: { orders: OrderWithUser[] }) {
  const orderColumns = [
    {
      header: 'Order ID',
      render: (o: Order) => `#${o.id.slice(-6).toUpperCase()}`,
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
        <Link href={`/user/orders/${o.id}`}>
          <Button variant="naked">
            <Eye size={18} />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <DataTable<OrderWithUser & { id: string }>
      data={orders}
      columns={orderColumns}
      emptyMessage="No orders found"
    />
  )
}
