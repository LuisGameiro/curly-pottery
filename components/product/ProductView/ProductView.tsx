'use client'

import Image from 'next/image'
import s from './ProductView.module.css'
import { useEffect, useState } from 'react'
import { ProductSlider, ProductCard } from '@components/product'
import { Button, Container, Marquee, Text } from '@components/ui'
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
import { Undo2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProductViewProps {
  product: ProductWithVariantsCategories
  relatedProducts: Product[]
}

const ProductView = ({ product, relatedProducts = [] }: ProductViewProps) => {
  const router = useRouter()
  const [variant, setVariant] = useState<Variant | undefined>(
    product.variants[0],
  )

  useEffect(() => {
    if (!variant) return
    trackEvent('view_product', {
      name: product.name,
      currency: variant.currency,
      sku: variant.sku,
      price: calculateDiscount(
        Number(variant.price),
        variant.discounts as Discount[],
      ).finalPrice,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, variant?.id])

  if (!variant) {
    return (
      <Container
        clean
        className="bg-linear-to-r from-background to-accent-2"
        data-testid="product-view"
      >
        <section className={s.root}>
          <div className="flex-center flex-col py-20">
            <Text variant="heading">Product Unavailable</Text>
            <Text className="text-muted mt-2">
              This product has no variants configured.
            </Text>
            <Button
              variant="slim"
              className="mt-4"
              onClick={() => router.push('/shop')}
            >
              Back to Shop
            </Button>
          </div>
        </section>
      </Container>
    )
  }

  return (
    <Container
      clean
      className="bg-linear-to-r from-background to-accent-2"
      data-testid="product-view"
    >
      <section className={s.root}>
        <div className={s.main}>
          <ProductSlider>
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL={shimmerDataUrl(500, 500)}
                />
              </div>
            ))}
          </ProductSlider>
        </div>
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="naked"
            color="primary"
            onClick={() =>
              window.history.length > 1 ? router.back() : router.push('/shop')
            }
          >
            <Undo2 size={24} />
          </Button>
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
        <section className="sm:px-4 md:px-8 pb-4 border-t border-border mt-12">
          <Text variant="sectionHeading" className="px-2 mb-4">
            You Might Also Like
          </Text>
          <Marquee >
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.slug}
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
