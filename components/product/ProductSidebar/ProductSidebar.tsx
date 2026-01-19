"use client";

import s from "./ProductSidebar.module.css";
import { useState } from "react";
import { Button, Text } from "@components/ui";
import Link from "next/link";
import { cn } from "@lib/utils";
import ProductOptions from "../ProductOptions";
import { calculateDiscount } from "@lib/calculate-price";
import useCart from "@lib/hooks/useCart";
import {
  Detail,
  Category,
  ProductWithVariantsCategories,
  Variant,
  Discount,
} from "@lib/types/types";

interface ProductSidebarProps {
  product: ProductWithVariantsCategories;
  variant: Variant;
  setVariant: (variant: Variant) => void;
  className?: string;
}

const ProductSidebar = (
  {
    product,
    className,
    variant,
    setVariant
  }: ProductSidebarProps
) => {
  const { addItem } = useCart();

  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<null | Error>(null);

  const forSale = variant?.stock !== 0 || variant?.availableForSale;

  const addToCart = async () => {
    setLoading(true);
    setError(null);
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
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        console.error(err);
        setError({
          ...err,
          message: "Could not add item to cart. Please try again.",
        });
      }
    }
  };

  const price = calculateDiscount(
    variant.price,
    variant.discounts as Discount[],
  );

  return (
    <div className={cn(className, "space-y-4")}>
      <section>
        <h1 className="text-3xl font-semibold ">{product.name}</h1>
        {product.categories.map((category: Category) => (
          <span key={category.id} className={"text-xl mr-2"}>
            {category.name}
          </span>
        ))}
      </section>

      <section>
        <p className="text-lg font-medium  space-x-2 my-2">
          {price.hasDiscount ? (
            <>
              <span className="line-through opacity-40">{price.price}</span>
              <span>{price.finalPrice}</span>

              <span className=" bg-red-500 p-1 px-2 border-2 border-accent-9 bg-center">
                SALE
              </span>
            </>
          ) : (
            <span>{price.finalPrice}</span>
          )}
        </p>

        <p className="text-sm">
          VAT included for EU orders. Duties and import taxes are calculated at
          checkout for U.S. customers Shipping calculated at checkout.{" "}
        </p>
        {/* <p className="py-2">
          {error && <ErrorMessage message={error} />}
        </p> */}

        {!forSale ? (
          <div
            className="bg-red text-accent-0 cursor-pointer 
                      px-10 py-3 leading-6 transition ease-in-out duration-150
                      shadow-sm text-center justify-center 
                      border border-transparent items-center text-sm font-semibold
                      tracking-wide"
          >
            <h3 className={s.button}>OUT OF STOCK</h3>
            <Link href="/contacts">
              Please contact us if you want to order this product
            </Link>
          </div>
        ) : (
          <div className="flex flex-row gap-2 items-center border border-border">
            <div className="flex flex-row  text-xl font-semibold">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className=" px-4  hover:bg-accent-1 transition"
              >
                -
              </button>
              <span className="flex flex-row px-6  col-span-2 justify-center font-semibold select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4  hover:bg-accent-1 transition "
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
          <div>
            <h2 className="text 2xl font-semibold">Product details:</h2>

            <div className="ml-10 space-y-4">
              {(variant.details as Detail[]).map((detail: Detail) => (
                <div key={detail.title}>
                  <span className="font-semibold">{detail.title}: </span>
                  <span>{detail.description}</span>
                </div>
              ))}
            </div>

            <p>
              Because each strainer is hand-carved, you may notice slight
              variations in shape and size. These unique differences are what
              make every strainer special and full of character.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text 2xl font-semibold">Care Instructions</h2>
        <p>
          Gently rinse with warm water and mild soap after use. Avoid soaking
          for long periods to preserve the bamboo natural beauty. Dry thoroughly
          before storing.
        </p>
      </section>

      <section>
        <h2 className="text 2xl font-semibold">About Pottery</h2>
        <p>
          Please expect some slight inperfections as every piece is hand made
          and hand glazed which makes it unique to you.
        </p>
      </section>
      <section>
        <h2>Lets Stay connected</h2>
        <p>
          I’d love to see how you style your tea strainer alongside my ceramics!
          Tag me on Instagram @curlypottery to share your photos, or follow
          along for behind-the-scenes updates and inspiration.
        </p>
      </section>
    </div>
  );
};

export default ProductSidebar;
