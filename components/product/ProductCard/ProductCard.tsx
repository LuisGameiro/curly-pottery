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
  priority?: boolean
}

const placeholderImg = '/product-img-placeholder.svg'

const ProductCard = ({
  product,
  imgProps,
  className,
  noNameTag = false,
  variant = 'default',
  priority = false,
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
      : { price: null, finalPrice: null, hasDiscount: false }

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={rootClassName}
      aria-label={product.name}
      data-testid={'product-card-' + product.slug}
    >
      {variant === 'slim' && (
        <div className="relative w-full h-full">
          {product?.images && (
            <Image
              src={product.images[0] || placeholderImg}
              alt={product.name || 'Product Image'}
              height={250}
              width={250}
              quality={85}
              crossOrigin="anonymous"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                aspectRatio: '1/1',
                objectFit: 'cover',
              }}
              {...imgProps}
              priority={priority}
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
                crossOrigin="anonymous"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading={priority ? undefined : 'lazy'}
                style={{
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                }}
                {...imgProps}
                priority={priority}
                placeholder="blur"
                blurDataURL={shimmerDataUrl(500, 500)}
              />
            )}
            <FavouriteButton
              productId={product.id}
              size="md"
              className="absolute top-2 right-2 z-30 p-2 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40"
            />
            {price != null && (
              <div className="absolute bottom-2 right-2 z-20 rounded-md bg-background/20 px-2 py-1 text-sm font-medium text-base backdrop-blur">
                {hasDiscount ? (
                  <>
                    <span className="line-through opacity-40 mr-1">
                      £ {String(price)}
                    </span>
                    <span>£ {String(finalPrice)}</span>
                  </>
                ) : (
                  <span>£ {String(price)}</span>
                )}
              </div>
            )}
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading={priority ? undefined : 'lazy'}
              style={{
                aspectRatio: '1/1',
                objectFit: 'cover',
              }}
              {...imgProps}
              priority={priority}
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
