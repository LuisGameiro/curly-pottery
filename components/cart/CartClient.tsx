'use client'

import { CartItem } from '@components/cart'
import { Container, Text, Button } from '@components/ui'
import useCart from '@lib/hooks/useCart'
import { CartLineItem } from '@lib/types/types'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

import { showCurrency } from '@lib/calculate-price'

export default function CartClient() {
  const { data, isEmpty, isLoading } = useCart()

  if (isLoading) {
    return (
      <Container className="py-20 flex-col flex-center">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-2" />
          <div className="h-6 w-48 mx-auto rounded bg-accent-2" />
        </div>
      </Container>
    )
  }

  if (isEmpty) {
    return (
      <Container className="py-20 flex-col flex-center">
        <ShoppingBag size={64} className="text-muted mb-4" />
        <Text variant="heading">Your cart is empty</Text>
      </Container>
    )
  }

  const currencySymbol = showCurrency[data?.currency || 'GBP']

  return (
    <Container>
      <header>
        <Text variant="heading">Shopping Cart</Text>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8">
          <ul className="divide-y border-b">
            {data?.lineItems.map((item: CartLineItem) => (
              <CartItem key={item.variantId} item={item} />
            ))}
          </ul>
        </div>

        <Container variant="box" className="lg:col-span-4">
          <Text variant="boxTitle">Order Summary</Text>
          <div className="space-y-1 pb-4 border-b">
            <div className="flex justify-between">
              <Text className="text-muted">Subtotal</Text>
              <Text>
                {currencySymbol} {data?.subtotalPrice?.toFixed(2) ?? ''}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-muted">Shipping (4-5 working days)</Text>
              <Text className="text-green">Calculated at checkout</Text>
            </div>
          </div>
          <div className="text-lg flex justify-between py-2">
            <Text variant="bold">Total</Text>
            <Text variant="bold">
              {currencySymbol} {data?.totalPrice.toFixed(2)}
            </Text>
          </div>
          <Link href="/checkout">
            <Button variant="slim">Checkout Now</Button>
          </Link>
        </Container>
      </div>
    </Container>
  )
}
