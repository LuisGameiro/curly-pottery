"use client";

import s from "./ProductSidebar.module.css";
import { useState } from "react";
import { Button, Text } from "@components/ui";
import Link from "next/link";
import { cn } from "@lib/utils";
import ProductOptions from "../ProductOptions";
import { calculateDiscount, showCurrency } from "@lib/calculate-price";
import useCart from "@lib/hooks/useCart";
import {
  Detail,
  Category,
  ProductWithVariantsCategories,
  Variant,
  Discount,
} from "@lib/types/types";
import { toast } from "sonner";

interface ProductSidebarProps {
  product: ProductWithVariantsCategories;
  variant: Variant;
  setVariant: (variant: Variant) => void;
  className?: string;
}

const ProductSidebar = ({
  product,
  className,
  variant,
  setVariant,
}: ProductSidebarProps) => {
  const { addItem } = useCart();

  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const forSale = variant?.stock !== 0 || variant?.availableForSale;

  const addToCart = async () => {
    setLoading(true);
    try {
      addItem(
        {
          ...product,
          variants: [
            {
              ...variant,
              details: variant.details as Detail[],
              discounts: variant.discounts as Discount[],
            },
          ],
        },
        quantity,
      );
      toast("Product added to cart");
    } catch {
      toast("Error adding item to cart");
    } finally {
      setLoading(false);
    }
  };

  const price = calculateDiscount(
    variant.price,
    variant.discounts as Discount[],
  );

  return (
    <div className={cn(className, "space-y-4")}>
      <section>
        <Text variant="heading">{product.name}</Text>
        {product.categories.map((category: Category) => (
          <Text key={category.id} variant="subHeading" className={"mr-2"}>
            {category.name}
          </Text>
        ))}
      </section>

      <section className="space-y-4">
        <Text variant="sectionHeading">
          {price.hasDiscount ? (
            <>
              <span className="line-through opacity-40">
                {showCurrency[variant.currency]} {price.price}
              </span>
              <span>{price.finalPrice}</span>

              <span className=" bg-red-500 p-1 px-2 border-2 border-accent-9 bg-center">
                SALE
              </span>
            </>
          ) : (
            <span>
              {showCurrency[variant.currency]} {price.finalPrice}
            </span>
          )}
        </Text>

        <p className="text-xs">
          VAT included for UK orders. Duties and import taxes are calculated at
          checkout for other customers Shipping calculated at checkout.{" "}
        </p>

        {!forSale ? (
          <div className="bg-red-500/20 px-10 py-2 text-center justify-center border border-primary items-center tracking-wide">
            <Text variant="bold" className={s.button}>
              OUT OF STOCK
            </Text>
            <Link href="/contacts">
              <Text className="underline text-secondary-2">
                Please contact us if you want to order this product
              </Text>
            </Link>
          </div>
        ) : (
          <div className="flex flex-row gap-4 items-center border border-border">
            <div className="flex h-16 flex-1 text-2xl font-semibold items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex px-4 h-full  hover:bg-accent-1 transition items-center"
              >
                -
              </button>
              <span className="px-6 ">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex px-4 h-full  hover:bg-accent-1 transition items-center"
              >
                +
              </button>
            </div>
            <Button
              aria-label="Add to Cart"
              type="button"
              className={s.button}
              onClick={addToCart}
              loading={loading}
              disabled={!variant.availableForSale}
            >
              {variant?.availableForSale ? "Add To Cart" : "Not Available"}
            </Button>
          </div>
        )}
      </section>

      <Text
        className="wrap-break-word w-full max-w-xl "
        html={product.description}
      />
      <ProductOptions product={product} setVariant={setVariant} />

      <section>
        {!!variant.details && (
          <div className="space-y-6">
            <Text variant="bold">Product details:</Text>

            <div className="ml-10 space-y-4">
              {(variant.details as Detail[]).map((detail: Detail) => (
                <div key={detail.title}>
                  <span className="font-semibold">{detail.title}: </span>
                  <span>{detail.description}</span>
                </div>
              ))}
            </div>

            <Text>
              Because each strainer is hand-carved, you may notice slight
              variations in shape and size. These unique differences are what
              make every strainer special and full of character.
            </Text>
          </div>
        )}
      </section>

      <section>
        <Text variant="bold">Care Instructions</Text>
        <Text>
          Gently rinse with warm water and mild soap after use. Avoid soaking
          for long periods to preserve the bamboo natural beauty. Dry thoroughly
          before storing.
        </Text>
      </section>

      <section>
        <Text variant="bold">About Pottery</Text>
        <Text>
          Please expect some slight inperfections as every piece is hand made
          and hand glazed which makes it unique to you.
        </Text>
      </section>
      <section>
        <Text variant="bold">Lets Stay connected</Text>
        <Text>
          I’d love to see how you style your tea strainer alongside my ceramics!
          Tag me on Instagram @curlypottery to share your photos, or follow
          along for behind-the-scenes updates and inspiration.
        </Text>
      </section>
    </div>
  );
};

export default ProductSidebar;
