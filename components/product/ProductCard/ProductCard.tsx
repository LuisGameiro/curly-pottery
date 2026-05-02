'use client'

import Link from 'next/link'
import s from './ProductCard.module.css'
import Image, { ImageProps } from 'next/image'
import { cn } from '@lib/utils'
import { calculateDiscount } from '@lib/calculate-price'
import {
  Discount,
  Product,
  ProductWithVariantsCategories,
} from '@lib/types/types'
import { shimmerDataUrl } from '@lib/shimmer'
import FavouriteButton from '@components/common/FavouriteButton/FavouriteButton'

interface Props {
  className?: string
  product: ProductWithVariantsCategories | Product
  noNameTag?: boolean
  imgProps?: Omit<ImageProps, 'src' | 'layout' | 'placeholder' | 'blurDataURL'>
  variant?: 'default' | 'slim' | 'simple'
}

const placeholderImg = '/product-img-placeholder.svg'

const ProductCard = ({
  product,
  imgProps,
  className,
  noNameTag = false,
  variant = 'default',
}: Props) => {
  const rootClassName = cn(
    s.root,
    { [s.slim]: variant === 'slim', [s.simple]: variant === 'simple' },
    className,
  )

  const { finalPrice, price, hasDiscount } =
    product && 'variants' in product && product.variants.length > 0
      ? calculateDiscount(
        Number(product.variants[0].price),
        product.variants[0].discounts as Discount[],
      )
      : { price: '0', finalPrice: '0', hasDiscount: false }

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={rootClassName}
      aria-label={product.name}
    >
      {variant === 'slim' && (
        <div className="relative w-full h-full p-2 gap-2">
          {product?.images && (
            <Image
              src={product.images[0] || placeholderImg}
              alt={product.name || 'Product Image'}
              height={250}
              width={250}
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                aspectRatio: '1/1',
                objectFit: 'cover',
                padding: '2px',
              }}
              {...imgProps}
              placeholder="blur"
              blurDataURL={shimmerDataUrl(250, 250)}
            />
          )}
        </div>
      )}

      {variant === 'simple' && (
        <div className="flex flex-col h-full">
          <div className={cn(s.imageContainer, 'relative')}>
            {product?.images && (
              <Image
                alt={product.name || 'Product Image'}
                className={s.productImage}
                src={product.images[0] || placeholderImg}
                height={500}
                width={500}
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                style={{
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                }}
                {...imgProps}
                placeholder="blur"
                blurDataURL={shimmerDataUrl(500, 500)}
              />
            )}
            <FavouriteButton
              productId={product.id}
              size="md"
              className="absolute top-2 right-2 z-30 p-2 rounded-full  hover:bg-background/40"
            />
            <div className="absolute bottom-2 right-2 z-20 rounded-md bg-background/20 px-2 py-1 text-sm font-medium text-base backdrop-blur">
              {hasDiscount ? (
                <>
                  <span className="line-through opacity-40 mr-1">
                    £ {typeof price === 'number' ? price : price.toString()}
                  </span>
                  <span>
                    £{' '}
                    {typeof finalPrice === 'number'
                      ? finalPrice
                      : finalPrice.toString()}
                  </span>
                </>
              ) : (
                <span>
                  £ {typeof price === 'number' ? price : price.toString()}
                </span>
              )}
            </div>
          </div>
          {!noNameTag && (
            <h3 className="mt-2 text-base capitalize font-medium text-base">
              {product.name}
            </h3>
          )}
        </div>
      )}

      {variant === 'default' && (
        <div className={s.imageContainer}>
          {product?.images && (
            <Image
              alt={product.name || 'Product Image'}
              className={s.productImage}
              src={product.images[0] || placeholderImg}
              height={500}
              width={500}
              quality={100}
              style={{
                aspectRatio: '1/1',
                objectFit: 'cover',
              }}
              {...imgProps}
              placeholder="blur"
              blurDataURL={shimmerDataUrl(500, 500)}
            />
          )}
          <FavouriteButton
            productId={product.id}
            size="lg"
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40"
          />
        </div>
      )}
    </Link>
  )
}

export default ProductCard
