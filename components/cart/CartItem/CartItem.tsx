"use client";

import { ChangeEvent, useState } from "react";
import cn from "clsx";
import Image from "next/image";
import Link from "next/link";
import Quantity from "@components/ui/Quantity";
import useCart from "@lib/hooks/useCart";
import { calculateDiscount } from "@lib/calculate-price";
import { Trash } from "lucide-react";
import { Button, Text } from "@components/ui";
import { CartLineItem } from "@lib/types/types";

const placeholderImg = "/product-img-placeholder.svg";

const CartItem = ({
  item,
  variant = "default",
  ...rest
}: {
  variant?: "default" | "display";
  item: CartLineItem;
}) => {
  const { removeItem, updateItem } = useCart();
  const [removing, setRemoving] = useState(false);
  const [quantity, setQuantity] = useState<number>(item.quantity);

  const price = calculateDiscount(item.price, item.discounts);

  const handleChange = async ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(value));
    await updateItem(item.variantId, Number(value));
  };

  const increaseQuantity = async (n = 1) => {
    const val = Number(quantity) + n;
    setQuantity(val);
    await updateItem(item.variantId, Number(val));
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeItem(item.variantId);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <li
      className={cn(
        "border-b border-accent-2 last:border-b-0 sm:flex justify-between py-2",
        {
          "opacity-50 pointer-events-none": removing,
        },
      )}
      {...rest}
    >
      <div className="flex items-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent-1 rounded-md overflow-hidden border border-accent-2 mr-2">
          <Link
            href={`/shop/${item.slug}`}
            className="relative block w-full h-full"
          >
            <Image
              src={item.images || placeholderImg}
              alt={item.sku || "Product Image"}
              className="object-cover"
              fill
              sizes="80px"
            />
          </Link>
        </div>

        <div className="ml-2 flex-1 items-center">
          <Link href={`/shop/${item.slug}`}>
            <Text
              variant="bold"
              className="hover:underline mb-1 block max-w-xs"
            >
              {item.name}
            </Text>
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            {item.colorName && (
              <Text
                variant="bold"
                className="uppercase tracking-wider px-3 py-1 rounded-md bg-accent-1 border border-accent-2 text-accent-7"
              >
                {item.colorName}
              </Text>
            )}
            {item.sizeName && (
              <Text
                variant="bold"
                className="text-sm uppercase tracking-wider px-3 py-1 rounded-md bg-accent-1 border border-accent-2 text-accent-7"
              >
                {item.sizeName}
              </Text>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end py-2">
        {variant === "default" ? (
          <div className="flex items-center">
            <Quantity
              value={quantity}
              handleRemove={handleRemove}
              handleChange={handleChange}
              increase={() => increaseQuantity(1)}
              decrease={() => increaseQuantity(-1)}
              max={item.stock}
            />
          </div>
        ) : (
          <div className="text-xs text-accent-6 italic">
            Qty: <span className="font-medium text-accent-9">{quantity}</span>
          </div>
        )}

        {price.hasDiscount && (
          <span className="font-semibold text-sm ml-4 text-red-500 line-through">
            x {price.price} £
          </span>
        )}

        <span className="font-semibold text-sm mx-4">
          x {price.finalPrice} £ = {quantity * price.finalPrice} £
        </span>
        <Button
          type="button"
          onClick={handleRemove}
          color="danger"
          title="Remove item"
          variant="naked"
        >
          <Trash width={18} height={18} />
        </Button>
      </div>
    </li>
  );
};

export default CartItem;
