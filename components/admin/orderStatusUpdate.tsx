'use client'

import React, { useState, useTransition } from 'react'
import { BellIcon, Loader2 } from 'lucide-react'
import { Text, Container } from '@components/ui'
import { cn } from '@lib/utils'
import { OrderStatus } from '@lib/types/types'
import { updateOrderStatus } from 'actions/order.actions'

interface OrderStatusProps {
  orderId: string
  currentStatus: OrderStatus
}

const OrderStatusUpdate = ({ orderId, currentStatus }: OrderStatusProps) => {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState(currentStatus)

  const handleStatusChange = (newStatus: OrderStatus) => {
    setLocalStatus(newStatus)

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus)
      } catch (error) {
        setLocalStatus(currentStatus)
        console.error('Failed to update status', error)
      }
    })
  }

  return (
    <Container variant="box" className="space-y-3">
      <div className="flex items-center gap-2 border-b pb-2">
        {isPending ? (
          <Loader2 size={18} className="text-secondary animate-spin" />
        ) : (
          <BellIcon size={18} className="text-muted" />
        )}
        <Text variant="bold">Status</Text>
      </div>

      <select
        className={cn(
          'w-full border-border text-sm font-medium rounded-lg px-3 py-2 outline-none border-none cursor-pointer transition-opacity',
          isPending && 'opacity-50 pointer-events-none',
        )}
        value={localStatus}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        disabled={isPending}
      >
        <option value="PENDING">Pending</option>
        <option value="PAID">Paid</option>
        <option value="SHIPPED">Shipped</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="COMPLETED">Completed</option>
      </select>
    </Container>
  )
}

export default OrderStatusUpdate
