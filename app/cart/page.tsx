"use client";

import { CartItem } from "@components/cart";
import Layout from "@components/common/Layout";
import { Container, Text, Button } from "@components/ui";
import useCart from "@lib/hooks/useCart";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function CartPage() {
  const { data, isLoading, isEmpty } = useCart();

  useEffect(() => {}, [data]);

  if (isLoading)
    return <Container className="py-20 text-center">Loading...</Container>;

  if (isEmpty) {
    return (
      <Container className="py-20 flex flex-col items-center justify-center ">
        <ShoppingBag size={64} className="text-accent-4 mb-4" />
        <Text variant="heading">Your cart is empty</Text>
      </Container>
    );
  }

  return (
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-4">
        <Text variant="heading" className="mb-6">
          Shopping Cart
        </Text>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10@">
        <div className="lg:col-span-8">
          <ul className="divide-y border-b">
            {data?.lineItems.map((item: any) => (
              <CartItem
                key={item.id}
                item={item}
                currencyCode={data.currency}
              />
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4 bg-slate-50 p-8 rounded-3xl h-fit sticky top-24">
          <Text variant="sectionHeading" className="mb-4">
            Order Summary
          </Text>
          <div className="space-y-2 pb-4 border-b">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>£{data?.subtotalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shipping</span>
              <span className="text-green-600 font-bold">
                Calculated at next step
              </span>
            </div>
          </div>
          <div className="flex justify-between py-4 text-xl font-bold">
            <span>Total</span>
            <span>£{data?.totalPrice.toFixed(2)}</span>
          </div>
          <Link href="/checkout">
            <Button >
              Checkout Now
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
