"use client";

import Image from "next/image";
import s from "./ProductView.module.css";
import { useState } from "react";
import { ProductSlider, ProductCard } from "@components/product";
import { Container, Marquee } from "@components/ui";
import ProductSidebar from "../ProductSidebar";
import {
  Discount,
  Product,
  ProductWithVariantsCategories,
  Variant,
} from "@lib/types/types";
import { cn } from "@lib/utils";
import { trackEvent } from "@lib/analytics/trackEvents";
import { calculateDiscount } from "@lib/calculate-price";

export const getRelatedProducts = async (
  categories: string[],
  excludeId: number,
) => {
  const params = new URLSearchParams({
    categories: categories.join(","),
    excludeId: excludeId.toString(),
    limit: "4",
  });

  const res = await fetch(`/api/related-products?${params}`);
  return res.json();
};

interface ProductViewProps {
  product: ProductWithVariantsCategories;
  relatedProducts: Product[];
}

const ProductView = ({ product, relatedProducts = [] }: ProductViewProps) => {
  const [variant, setVariant] = useState<Variant>(product.variants[0]);

  trackEvent("view_product", {
    name: product.name,
    currency: variant.currency,
    sku: variant.sku,
    price: calculateDiscount(variant.price, variant.discounts as Discount[])
      .finalPrice,
  });

  return (
    <>
      <Container clean>
        <section className={cn(s.root)}>
          <div className={cn(s.main)}>
            <ProductSlider key={variant.id}>
              {variant.images.map((image, i) => (
                <div key={image} className={s.imageContainer}>
                  <Image
                    className={s.img}
                    src={image}
                    alt={`${product.name} Image ${i}`}
                    width={2400}
                    height={2400}
                    priority={i === 0}
                    quality="100"
                  />
                </div>
              ))}
            </ProductSlider>
          </div>

          <ProductSidebar
            key={product.id}
            product={product}
            variant={variant}
            setVariant={setVariant}
            className={s.sidebar}
          />
        </section>

        {relatedProducts.length > 0 && (
          <Marquee variant="secondary">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.slug}
                noNameTag
                product={p}
                variant="slim"
                className="animated fadeIn"
                imgProps={{
                  alt: p.name,
                }}
              />
            ))}
          </Marquee>
        )}
      </Container>
    </>
  );
};

export default ProductView;
