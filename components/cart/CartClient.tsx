'use client'

import { CartItem } from '@components/cart'
import { Container, Text, Button } from '@components/ui'
import useCart from '@lib/hooks/useCart'
import { CartLineItem } from '@lib/types/types'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CartClient() {
  const { data, isLoading, isEmpty } = useCart()

  // if (!isLoading)
  //   return <Container className="py-20 text-center">Loading...</Container>

  if (isEmpty) {
    return (
      <Container className="py-20 flex flex-col items-center justify-center ">
        <ShoppingBag size={64} className="text-accent-4 mb-4" />
        <Text variant="heading">Your cart is empty</Text>
      </Container>
    )
  }

  return (
    <Container>
      <header>
        <Text variant="heading">Shopping Cart</Text>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
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
              <Text className="text-accent-8">Subtotal</Text>
              <Text>£ {data?.subtotalPrice.toFixed(2)}</Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-accent-8">Shipping</Text>
              <Text className="text-green-600">next step</Text>
            </div>
          </div>
          <div className="text-lg flex justify-between py-2">
            <Text variant="bold">Total</Text>
            <Text variant="bold">£ {data?.totalPrice.toFixed(2)}</Text>
          </div>
          <Link href="/checkout">
            <Button variant="slim">Checkout Now</Button>
          </Link>
        </Container>
      </div>
    </Container>
  )
}
