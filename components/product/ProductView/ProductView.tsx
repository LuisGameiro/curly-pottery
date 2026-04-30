'use client'

import Image from 'next/image'
import s from './ProductView.module.css'
import { useState } from 'react'
import { ProductSlider, ProductCard } from '@components/product'
import { Container, Marquee, Text } from '@components/ui'
import ProductSidebar from '../ProductSidebar'
import {
  Discount,
  Product,
  ProductWithVariantsCategories,
  Variant,
} from '@lib/types/types'
import { trackEvent } from '@lib/analytics/trackEvents'
import { calculateDiscount } from '@lib/calculate-price'
import { shimmerDataUrl } from '@lib/shimmer'

interface ProductViewProps {
  product: ProductWithVariantsCategories
  relatedProducts: Product[]
}

const ProductView = ({ product, relatedProducts = [] }: ProductViewProps) => {
  const [variant, setVariant] = useState<Variant>(product.variants[0])

  trackEvent('view_product', {
    name: product.name,
    currency: variant.currency,
    sku: variant.sku,
    price: calculateDiscount(
      Number(variant.price),
      variant.discounts as Discount[],
    ).finalPrice,
  })

  return (
    <Container clean className="bg-linear-to-r from-background to-accent-2">
      <section className={s.root}>
        <div className={s.main}>
          <ProductSlider key={variant.id}>
            {variant.images.map((image: string, i: number) => (
              <div key={image} className={s.imageContainer}>
                <Image
                  className={s.img}
                  src={image}
                  alt={`${product.name} Image ${i}`}
                  priority={i === 0}
                  width={1000}
                  height={1000}
                  quality={100}
                  placeholder="blur"
                  blurDataURL={shimmerDataUrl(500, 500)}
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
        <section className="py-12 border-t border-border mt-12">
          <Text variant="sectionHeading" className="mb-8 text-center">
            You Might Also Like
          </Text>
          <Marquee variant="secondary">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.slug}
                noNameTag
                product={p}
                variant="slim"
                imgProps={{
                  alt: p.name,
                }}
              />
            ))}
          </Marquee>
        </section>
      )}
    </Container>
  )
}

export default ProductView
