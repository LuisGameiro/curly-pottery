"use client";

import Image from "next/image";
import s from "./ProductView.module.css";
import { useState } from "react";
import { ProductSlider, ProductCard } from "@components/product";
import { Container, Text } from "@components/ui";
import { SEO } from "@components/common";
import ProductSidebar from "../ProductSidebar";
import {
  Product,
  ProductWithVariantsCategories,
  Variant,
} from "@lib/types/types";
import { cn } from "@lib/utils";

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

  return (
    <>
      <Container className="p-0 m-0" clean>
        <section className={cn(s.root,"p-0 m-0")}>
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
        <hr className="border" />

        {relatedProducts.length > 0 && (
          <section className="px-6 my-4">
            <Text variant="sectionHeading">Related Products</Text>
            <div className={s.relatedProductsGrid}>
              {relatedProducts.map((p) => (
                <div key={p.slug}>
                  <ProductCard
                    key={p.slug}
                    noNameTag
                    product={p}
                    variant="default"
                    className="animated fadeIn"
                    imgProps={{
                      alt: p.name,
                      className: "w-full h-full object-cover",
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>
      {/* <SEO
        title={product.name}
        description={product.description}
        openGraph={{
          type: "website",
          title: product.name,
          description: product.description,
          images: [
            {
              url: product.images[0],
              width: "800",
              height: "600",
              alt: product.name,
            },
          ],
        }}
      /> */}
    </>
  );
};

export default ProductView;
