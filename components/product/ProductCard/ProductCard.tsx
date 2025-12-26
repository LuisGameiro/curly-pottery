import Link from "next/link";
import type { FullProduct, Product } from "@lib/types/product";
import s from "./ProductCard.module.css";
import Image, { ImageProps } from "next/image";
// import WishlistButton from '@components/wishlist/WishlistButton'
// import usePrice from '@framework/product/use-price'
import ProductTag from "../ProductTag";
import { cn } from "@lib/utils";
import { FC } from "react";
import { calculatePrice } from "@lib/calculate-price";

interface Props {
  className?: string;
  product: Product;
  noNameTag?: boolean;
  imgProps?: Omit<ImageProps, "src" | "layout" | "placeholder" | "blurDataURL">;
  variant?: "default" | "slim" | "simple";
  admin?: boolean;
}

const placeholderImg = "/product-img-placeholder.svg";

const ProductCard: FC<Props> = ({
  product,
  imgProps,
  className,
  noNameTag = false,
  variant = "default",
  admin = false,
}) => {
  const rootClassName = cn(
    s.root,
    { [s.slim]: variant === "slim", [s.simple]: variant === "simple" },
    className,
  );

  const { priceCalculated, priceDiscount, hasDiscount } = product?.variants ? calculatePrice(product.variants[0].price, product.variants[0].currency, product.variants[0].discounts) : { priceCalculated: '$0.00', priceDiscount: '$0.00', hasDiscount: false };

  return (
    <Link
      href={admin?`/admin/products/${product.slug}`:`/shop/${product.slug}`}
      className={rootClassName}
      aria-label={product.name}
    >
      {variant === "slim" && (
        <>
          <div className="absolute top-0 bg-transparent left-0 z-20">
            <span>{product.categories[0].name}</span>
          </div>

          {product?.images && (
            <Image
              quality="100"
              src={product.images[0] || placeholderImg}
              alt={product.name || "Product Image"}
              height={320}
              width={320}
              {...imgProps}
            />
          )}
        </>
      )}

      {variant === "simple" && (
        <>
          {!noNameTag && (
            <h3 className="absolute bg-accent-3/60 top-0 left-0 z-20 px-2 py-1 text-xs md:text-md  lg:text-xl font-medium text-foreground">
              {product.name}
            </h3>
          )}
          <div className={s.imageContainer}>
            {product?.images && (
              <Image
                alt={product.name || "Product Image"}
                className={s.productImage}
                src={product.images[0] || placeholderImg}
                height={540}
                width={540}
                quality="85"
                {...imgProps}
              />
            )}
            <div className="absolute bottom-2 right-2 z-20 rounded-md bg-background/30  px-2 py-1 text-sm font-medium text-foreground backdrop-blur">
              {hasDiscount ? (
                <>
                  <span className="line-through opacity-40 mr-1">
                    {priceCalculated}
                  </span>
                  <span>{priceDiscount}</span>
                </>
              ) : (
                <span>{priceCalculated}</span>
              )}

            </div>
          </div>
        </>
      )}

      {variant === "default" && (
        <>
          {/* <ProductTag
            name={product.name}
            price={`${price} ${product.price?.currencyCode}`}
          /> */}
          <div className={s.imageContainer}>
            {product?.images && (
              <Image
                alt={product.name || "Product Image"}
                className={s.productImage}
                src={product.images[0] || placeholderImg}
                height={540}
                width={540}
                quality="100"
                {...imgProps}
              />
            )}
          </div>
        </>
      )}
    </Link>
  );
};

export default ProductCard;
