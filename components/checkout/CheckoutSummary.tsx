'use client'

import { Container, Text } from '@components/ui'
import { calculateDiscount } from '@lib/calculate-price'
import { CartLineItem } from '@lib/types/types'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

export function CheckoutSummary() {
  const { watch, setValue } = useFormContext()
  const order = watch()

  useEffect(() => {
    const total =
      (order.subtotalPrice || 0) +
      (order.shippingPrice || 0) +
      (order.taxes || 0)
    setValue('totalPrice', total.toFixed(2))
  }, [order.subtotalPrice, order.shippingPrice, order.taxes, setValue])

  return (
    <Container variant="box" className="lg:col-span-4">
      <Text variant="boxTitle">Order Summary</Text>
      <div className="space-y-2 pb-4 border-b">
        {order?.lineItems &&
          order.lineItems.map((item: CartLineItem) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <Text className="text-accent-8">
                {item.quantity} x {item.name}
              </Text>
              <Text className="font-medium">
                £
                {(
                  calculateDiscount(item.price, item.discounts).finalPrice *
                  item.quantity
                ).toFixed(2)}
              </Text>
            </div>
          ))}
      </div>
      <div className="space-y-1 pb-4 border-b">
        <div className="flex justify-between">
          <Text>Subtotal</Text>
          <Text>£{order?.subtotalPrice.toFixed(2)}</Text>
        </div>
        <div className="flex justify-between">
          <Text>Taxes</Text>
          <Text className="text-green-600">
            {order?.taxes === 0 ? 'Included' : `£${order?.taxes.toFixed(2)}`}
          </Text>
        </div>
        <div className="flex justify-between">
          <Text>Shipping</Text>
          <Text className="text-green-600">
            {order?.shippingPrice === 0
              ? 'FREE'
              : `£${order?.shippingPrice.toFixed(2)}`}
          </Text>
        </div>
      </div>
      <div className="text-lg flex justify-between pt-2">
        <Text variant="bold">Total</Text>
        <Text variant="bold">£{order.totalPrice}</Text>
      </div>
    </Container>
  )
}
