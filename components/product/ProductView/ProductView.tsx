'use client'

import Image from 'next/image'
import s from './ProductView.module.css'
import { useState } from 'react'
import { ProductSlider, ProductCard } from '@components/product'
import { Container, Marquee } from '@components/ui'
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
    price: calculateDiscount(variant.price, variant.discounts as Discount[])
      .finalPrice,
  })

  return (
    <Container clean className="bg-linear-to-r from-background to-accent-2">
      <section className={s.root}>
        <div className={s.main}>
          <ProductSlider key={variant.id}>
            {variant.images.map((image: string, i: number) => (
              <div key={i} className={s.imageContainer}>
                <Image
                  className={s.img}
                  src={image}
                  alt={`${product.name} Image ${i}`}
                  priority={i === 0}
                  width={1000}
                  height={1000}
                  quality={100}
                  style={{
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                  }}
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
      )}
    </Container>
  )
}

export default ProductView
