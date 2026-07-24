'use client'

import { Eye } from 'lucide-react'
import { Button } from '@components/ui'
import DataTable from '@components/ui/Table/DataTable'
import { CartLineItem, Order, OrderWithUser } from '@lib/types/types'
import { StatusBadge } from '@components/admin/StatusBadge'
import { useRouter } from 'next/navigation'

export default function OrderTable({ orders }: { orders: OrderWithUser[] }) {
  const router = useRouter()

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
    { header: 'Total', render: (o: Order) => `£${Number(o.totalPrice).toFixed(2)}` },
    {
      header: 'Status',
      render: (o: Order) => <StatusBadge status={o.status} />,
    },
    {
      header: 'View',
      align: 'center' as const,
      render: (o: Order) => (
        <Button
          variant="naked"
          type="button"
          aria-label={`View order ${o.id.slice(-6).toUpperCase()}`}
          onClick={() => router.push(`/user/orders/${o.id}`)}
        >
          <Eye size={18} />
        </Button>
      ),
    },
  ]

  return (
    <div data-testid="order-user-table">
      <DataTable<OrderWithUser & { id: string }>
        data={orders}
        columns={orderColumns}
        emptyMessage="No orders found"
      />
    </div>
  )
}
