'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button, Text } from '@components/ui'
import useCart from '@lib/hooks/useCart'
import { useEffect } from 'react'

export default function SuccessPage() {
  const { deleteAll } = useCart()

  useEffect(() => {
    deleteAll()
  }, [deleteAll])

  return (
    <div className="flex flex-col items-center justify-center max-w-lg text-center py-20 px-4 mx-auto">
      <CheckCircle size={64} className="text-green-500 mb-4" />
      <Text variant="heading" className="mb-2">
        Order Confirmed!
      </Text>
      <Text className="text-muted text-justify mb-8  max-w-20">
        Thank you for your purchase. We have sent a confirmation email to your
        inbox. Your order is being processed and will be shipped soon.
      </Text>
      <Link
        href="/shop"
        className="text-secondary px-8 py-3 rounded-full font-bold"
      >
        <Button variant="secondary">Continue Shopping</Button>
      </Link>
    </div>
  )
}
