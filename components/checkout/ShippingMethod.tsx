import { Button, Text } from "@components/ui";
import { cn } from "@lib/utils";

const shippingOptions = [
  {
    method: "standard",
    conditions: "Standard Delivery (3-5 days)",
    price: 0,
  },
  {
    method: "express",
    conditions: "Next Day Delivery",
    price: 5.99,
  },
];

interface ShippingMethodProps {
  onComplete: (shippingPrice: number, shippingMethod: string) => void;
}

export default function ShippingMethod({ onComplete }: ShippingMethodProps) {
  return (
    <div className="space-y-8">
      <Text variant="sectionHeading">Select Shipping</Text>

      {shippingOptions.map((o) => (
        <Button
          key={o.method}
          variant="secondary"
          className="w-full"
          type="button"
          onClick={() => onComplete(o.price, o.method)}
        >
          <div className="w-full flex justify-between gap-4">
            <Text>{o.conditions}</Text>
            <Text
              className={cn("font-bold ", o.price === 0 && "text-green-600")}
            >
              {o.price === 0 ? "FREE" : o.price}
            </Text>
          </div>
        </Button>
      ))}
    </div>
  );
}
