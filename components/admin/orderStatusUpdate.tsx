'use client'

import React, { useEffect, useRef, useState, useTransition } from 'react'
import { BellIcon, Loader2 } from 'lucide-react'
import { Text, Container } from '@components/ui'
import { cn } from '@lib/utils'
import { OrderStatus } from '@lib/types/types'
import { updateOrderStatus } from '@actions/order.actions'
import { toast } from 'sonner'

interface OrderStatusProps {
  orderId: string
  currentStatus: OrderStatus
}

const OrderStatusUpdate = ({ orderId, currentStatus }: OrderStatusProps) => {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState(currentStatus)
  const [prevStatus, setPrevStatus] = useState(currentStatus)
  // Last status confirmed by the server — roll back here on failure so two
  // rapid changes don't revert to the original prop value.
  const lastGoodStatusRef = useRef(currentStatus)

  // Adjust state during render when the server-confirmed status changes
  // (React's documented pattern for derived state — setState in an effect is
  // what the lint rule forbids, this achieves the same sync safely).
  if (currentStatus !== prevStatus) {
    setPrevStatus(currentStatus)
    setLocalStatus(currentStatus)
  }

  // Keep the rollback target in sync with the server-confirmed status.
  // Ref writes belong in effects, so this needs no setState.
  useEffect(() => {
    lastGoodStatusRef.current = currentStatus
  }, [currentStatus])

  const handleStatusChange = (newStatus: OrderStatus) => {
    setLocalStatus(newStatus)

    startTransition(async () => {
      try {
        const response = await updateOrderStatus(orderId, newStatus)
        if (response.success) {
          lastGoodStatusRef.current = newStatus
          setLocalStatus(newStatus)
        } else {
          setLocalStatus(lastGoodStatusRef.current)
          toast.error(response.message)
        }
      } catch (error) {
        setLocalStatus(lastGoodStatusRef.current)
        toast.error('Failed to update status')
        console.error('Failed to update status', error)
      }
    })
  }

  return (
    <Container
      variant="box"
      className="space-y-3"
      data-testid="order-status-update"
    >
      <div className="flex items-center gap-2 border-b pb-2">
        {isPending ? (
          <Loader2 size={18} className="text-secondary animate-spin" />
        ) : (
          <BellIcon size={18} className="text-muted" />
        )}
        <Text variant="bold">Status</Text>
      </div>

      <select
        data-testid="order-status-select"
        className={cn(
          'w-full border border-border text-sm font-medium rounded-lg px-3 py-2 bg-background cursor-pointer transition-opacity focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2',
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
