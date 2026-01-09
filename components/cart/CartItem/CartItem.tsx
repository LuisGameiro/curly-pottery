'use client'

import { ChangeEvent, useEffect, useState } from "react";
import cn from "clsx";
import Image from "next/image";
import Link from "next/link";
import s from "./CartItem.module.css";
import { useUI } from "@components/ui/context";
import type { LineItem } from "@lib/types/inspiration/cart";
// import usePrice from '@framework/product/use-price'
// import useUpdateItem from '@framework/cart/use-update-item'
// import useRemoveItem from '@framework/cart/use-remove-item'
import Quantity from "@components/ui/Quantity";
import useCart from "@lib/hooks/useCart";
import { calculatePrice } from "@lib/calculate-price";

type ItemOption = {
  name: string;
  nameId: number;
  value: string;
  valueId: number;
};

const placeholderImg = "/product-img-placeholder.svg";

const CartItem = ({
  item,
  variant = "default",
  currencyCode,
  ...rest
}: {
  variant?: "default" | "display";
  item: LineItem;
  currencyCode: string;
}) => {
  const { removeItem, updateItem } = useCart()
  const { closeSidebarIfPresent } = useUI();
  const [removing, setRemoving] = useState(false);
  const [quantity, setQuantity] = useState<number>(item.quantity);

  const price = calculatePrice(item.variant.price, 'GBP', item.variant.discounts)
  // const { price } = usePrice({
  //   amount: item.variant.price * item.quantity,
  //   baseAmount: item.variant.listPrice * item.quantity,
  //   currencyCode,
  // })

  const handleChange = async ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(value));
     await updateItem(item.variantId,  Number(value) );
  };

  const increaseQuantity = async (n = 1) => {
    const val = Number(quantity) + n;
    setQuantity(val);
     await updateItem(item.variantId,  Number(val));
  }

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeItem(item.variantId);
    } catch (error) {
      setRemoving(false);
    }
  };

  // TODO: Add a type for this
  const options = (item as any).options;

  useEffect(() => {
    // Reset the quantity state if the item quantity changes
    if (item.quantity !== Number(quantity)) {
      setQuantity(item.quantity);
    }
    // TODO: currently not including quantity in deps is intended, but we should
    // do this differently as it could break easily
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.quantity]);


  return (
    <li
      className={cn(s.root, "border-b border-accent-2 last:border-b-0", {
        "opacity-50 pointer-events-none": removing,
      })}
      {...rest}
    >
      <div className="flex flex-row py-6 gap-4">
        {/* 1. PRODUCT IMAGE */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-accent-1 rounded-md overflow-hidden border border-accent-2 flex-shrink-0">
          <Link href={`/shop/${item.slug}`}>
            <Image
              onClick={() => closeSidebarIfPresent()}
              className="object-cover transition-transform hover:scale-105"
              fill // Use fill for better responsive behavior in a fixed container
              src={item.variant?.images?.[0] || placeholderImg}
              alt={item.variant?.sku || "Product Image"}
            />
          </Link>
        </div>

        {/* 2. PRODUCT INFO */}
        <div className="flex flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="flex justify-between items-start">
              <Link href={`/shop/${item.slug}`}>
                <span
                  className="font-medium text-sm sm:text-base hover:text-secondary transition-colors cursor-pointer"
                  onClick={() => closeSidebarIfPresent()}
                >
                  {item.name}
                </span>
              </Link>
              {/* Price moved here for better mobile visibility */}
              <div>              
                {price.hasDiscount && <span className="font-semibold text-sm ml-4 text-red-500 line-through">{price.priceCalculated}</span>}



                <span className="font-semibold text-sm ml-4">{price.priceDiscount}</span>
              </div>

            </div>

            {/* ATTRIBUTES BADGES */}
            <div className="flex items-center gap-2 mt-1.5">
              {item.variant?.colorName && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-1 border border-accent-2 text-accent-7">
                  {item.variant.colorName}
                </span>
              )}
              {item.variant?.sizeName && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-1 border border-accent-2 text-accent-7">
                  {item.variant.sizeName}
                </span>
              )}
            </div>
          </div>

          {/* 3. QUANTITY CONTROLS */}
          <div className="flex items-end justify-between mt-2">
            {variant === "default" ? (
              <div className="flex items-center">
                <Quantity
                  value={quantity}
                  handleRemove={handleRemove}
                  handleChange={handleChange}
                  increase={() => increaseQuantity(1)}
                  decrease={() => increaseQuantity(-1)}
                />
              </div>
            ) : (
              <div className="text-xs text-accent-6 italic">
                Qty: <span className="font-medium text-accent-9">{quantity}</span>
              </div>
            )}

            {/* Optional: Add a small delete button separate from quantity if your design allows */}
          </div>
        </div>
      </div>
    </li>
  )
};

export default CartItem;
