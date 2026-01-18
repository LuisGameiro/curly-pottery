"use client";

import { Container, Text } from "@components/ui";
import { CartLineItem } from "@lib/types/types";

interface CheckoutSummaryProps {
  items: CartLineItem[];
  total: number;
  tax: number;
  shipping: number;
}

export function CheckoutSummary({
  items = [],
  total,
  tax = 0,
  shipping = 0,
}: CheckoutSummaryProps) {
  return (
    <Container variant="box" className="lg:col-span-4">
      <Text variant="boxTitle">Order Summary</Text>
      <div className="space-y-2 pb-4 border-b">
        {items.map((item: CartLineItem) => (
          <div key={item.id} className="flex justify-between text-sm">
            <Text className="text-accent-8">
              {item.quantity}x {item.name}
            </Text>
            <Text className="font-medium">£{item.price * item.quantity}</Text>
          </div>
        ))}
      </div>
      <div className="space-y-1 pb-4 border-b">
        <div className="flex justify-between">
          <Text>Subtotal</Text>
          <Text>£{total}</Text>
        </div>
        <div className="flex justify-between">
          <Text>Taxes</Text>
          <Text className="text-green-600">
            {tax === 0 ? "Included" : `£${tax}`}
          </Text>
        </div>
        <div className="flex justify-between">
          <Text>Shipping</Text>
          <Text className="text-green-600">
            {shipping === 0 ? "FREE" : `£${shipping}`}
          </Text>
        </div>
      </div>
      <div className="text-lg flex justify-between pt-2">
        <Text variant="bold">Total</Text>
        <Text variant="bold">£{total + shipping}</Text>
      </div>
    </Container>
  );
}
