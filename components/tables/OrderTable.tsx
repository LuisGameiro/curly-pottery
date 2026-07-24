'use client'

import { Eye } from 'lucide-react'
import { Button } from '@components/ui'
import DataTable from '@components/ui/Table/DataTable'
import { CartLineItem, Order } from '@lib/types/types'
import { StatusBadge } from '@components/admin/StatusBadge'
import { useRouter } from 'next/navigation'

export default function OrderTable({
  orders,
  isLoading,
}: {
  orders: Order[]
  isLoading?: boolean
}) {
  const router = useRouter()

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
          <span className="text-xs text-muted">{o.email}</span>
        </div>
      ),
    },
    {
      header: 'Items',
      render: (o: Order) => {
        return (
          <div className="max-w-[150px] truncate">
            {((o?.lineItems as CartLineItem[]) || [])
              .map((i: CartLineItem) => `${i.quantity}x${i.sku}`)
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
        <Button
          variant="naked"
          type="button"
          aria-label={`View order ${o.id.slice(-6).toUpperCase()}`}
          onClick={() => router.push(`/admin/orders/${o.id}`)}
        >
          <Eye size={18} />
        </Button>
      ),
    },
  ]

  return (
    <div data-testid="admin-order-table">
      <DataTable
        data={orders}
        columns={orderColumns}
        isLoading={isLoading}
        emptyMessage="No orders found"
      />
    </div>
  )
}
