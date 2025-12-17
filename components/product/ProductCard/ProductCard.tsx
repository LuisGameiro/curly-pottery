import { FC } from 'react'
import cn from 'clsx'
import Link from 'next/link'
import type { Product } from '@lib/types/product'
import s from './ProductCard.module.css'
import Image, { ImageProps } from 'next/image'
// import WishlistButton from '@components/wishlist/WishlistButton'
// import usePrice from '@framework/product/use-price'
import ProductTag from '../ProductTag'

interface Props {
  className?: string
  product: Product
  noNameTag?: boolean
  imgProps?: Omit<ImageProps, 'src' | 'layout' | 'placeholder' | 'blurDataURL'>
  variant?: 'default' | 'slim' | 'simple'
}

const placeholderImg = '/product-img-placeholder.svg'

const ProductCard: FC<Props> = ({
  product,
  imgProps,
  className,
  noNameTag = false,
  variant = 'default',
}) => {
  // const { price } = usePrice({
  //   amount: product.price.value,
  //   baseAmount: product.price.retailPrice,
  //   currencyCode: product.price.currencyCode!,
  // })
  const { price } = { price: '$0.00' }
  const rootClassName = cn(
    s.root,
    { [s.slim]: variant === 'slim', [s.simple]: variant === 'simple' },
    className
  )

  return (
    <Link
      href={`/product/${product.slug}`}
      className={rootClassName}
      aria-label={product.name}
    >
      {variant === 'slim' && (
        <>
          <div className='absolute top-0 top-0 bg-transparent left-0 z-20' >
            <span>{product.categories[0]}</span>
          </div>

          {product?.images && (
            <Image
              quality="100"
              src={product.images[0]?.url || placeholderImg}
              alt={product.name || 'Product Image'}
              height={320}
              width={320}
              {...imgProps}
            />
          )}
        </>
      )}

      {variant === 'simple' && (
        <>
          {/* {process.env.COMMERCE_WISHLIST_ENABLED && (
            <WishlistButton
              className={s.wishlistButton}
              productId={product.id}
              variant={product.variants[0]}
            />
          )} */}
          {!noNameTag && (
              <h3 className='absolute top-0 left-0 z-20 px-2 py-1 text-xl font-medium text-foreground'>
                <span>{product.name}</span>
              </h3>
          )}
          <div className={s.imageContainer}>
            {product?.images && (
              <Image
                alt={product.name || 'Product Image'}
                className={s.productImage}
                src={product.images[0]?.url || placeholderImg}
                height={540}
                width={540}
                quality="85"
                {...imgProps}
              />
            )}
            <div className="absolute bottom-2 right-2 z-20 rounded-md bg-background/30  px-2 py-1 text-sm font-medium text-foreground backdrop-blur">
              {`${price} ${product.price?.currencyCode}`}
            </div>
          </div>
        </>
      )}

      {variant === 'default' && (
        <>
          {/* {process.env.COMMERCE_WISHLIST_ENABLED && (
            <WishlistButton
              className={s.wishlistButton}
              productId={product.id}
              variant={product.variants[0] as any}
            />
          )} */}
          {/* <ProductTag
            name={product.name}
            price={`${price} ${product.price?.currencyCode}`}
          /> */}
          <div className={s.imageContainer}>
            {product?.images && (
              <Image
                alt={product.name || 'Product Image'}
                className={s.productImage}
                src={product.images[0]?.url || placeholderImg}
                height={540}
                width={540}
                quality="85"
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
