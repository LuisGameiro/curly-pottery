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
          product.variants[0].price,
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
        <>
          {product?.images && (
            <Image
              quality="100"
              src={product.images[0] || placeholderImg}
              alt={product.name || 'Product Image'}
              height={320}
              width={320}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
              }}
              {...imgProps}
            />
          )}
        </>
      )}

      {variant === 'simple' && (
        <>
          {!noNameTag && (
            <h3 className="absolute bg-accent-3/60 top-0 left-0 z-20 px-2 py-1 text-xs md:text-md  lg:text-xl font-medium text-foreground">
              {product.name}
            </h3>
          )}
          <div className={s.imageContainer}>
            {product?.images && (
              <Image
                alt={product.name || 'Product Image'}
                className={s.productImage}
                src={product.images[0] || placeholderImg}
                height={540}
                width={540}
                loading="lazy"
                style={{
                  width: 'auto',
                  height: '64',
                  objectFit: 'cover',
                }}
                quality={100}
                {...imgProps}
              />
            )}
            <div className="absolute bottom-2 right-2 z-20 rounded-md bg-background/30  px-2 py-1 text-sm font-medium text-foreground backdrop-blur">
              {hasDiscount ? (
                <>
                  <span className="line-through opacity-40 mr-1">
                    £ {price}
                  </span>
                  <span>£ {finalPrice}</span>
                </>
              ) : (
                <span>£ {price}</span>
              )}
            </div>
          </div>
        </>
      )}

      {variant === 'default' && (
        <>
          <div className={s.imageContainer}>
            {product?.images && (
              <Image
                alt={product.name || 'Product Image'}
                className={s.productImage}
                src={product.images[0] || placeholderImg}
                height={540}
                width={540}
                quality="100"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                }}
                {...imgProps}
              />
            )}
          </div>
        </>
      )}
    </Link>
  )
}

export default ProductCard
