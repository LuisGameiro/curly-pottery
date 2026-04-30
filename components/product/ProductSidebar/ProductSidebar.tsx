'use client'

import s from './ProductSidebar.module.css'
import { useState, useEffect } from 'react'
import { Button, Collapse, ShareButton, Text } from '@components/ui'
import Link from 'next/link'
import { cn } from '@lib/utils'
import ProductOptions from '../ProductOptions'
import { calculateDiscount, showCurrency } from '@lib/calculate-price'
import useCart from '@lib/hooks/useCart'
import {
  Detail,
  Category,
  ProductWithVariantsCategories,
  Variant,
  Discount,
  CurrencyCode,
} from '@lib/types/types'
import { toast } from 'sonner'
import { Undo2 } from 'lucide-react'
import { trackEvent } from '@lib/analytics/trackEvents'
import FavouriteButton from '../../common/FavouriteButton/FavouriteButton'

interface ProductSidebarProps {
  product: ProductWithVariantsCategories
  variant: Variant
  setVariant: (variant: Variant) => void
  className?: string
}

const ProductSidebar = ({
  product,
  className,
  variant,
  setVariant,
}: ProductSidebarProps) => {
  const { addItem, data: cartData } = useCart()
  const existingInCart = cartData.lineItems.find(
    (i) => i.variantId === variant.id,
  )
  const inCartQuantity = existingInCart?.quantity || 0
  const remainingStock = variant.stock - inCartQuantity

  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Reset quantity to 1 when variant changes
  useEffect(() => {
    if (remainingStock > 0) {
      setQuantity(1)
    } else {
      setQuantity(0)
    }
  }, [variant.id, remainingStock])

  const forSale = variant?.stock !== 0 && variant?.availableForSale
  const addToCart = async () => {
    if (remainingStock <= 0) return
    setLoading(true)
    try {
      addItem(
        {
          ...product,
          variants: [
            {
              ...variant,
              details: variant.details as Detail[],
              discounts: variant.discounts as Discount[],
            },
          ],
        },
        quantity,
      )
      toast.success(`Added ${quantity} to cart`)
      trackEvent('add_to_cart', {
        name: product.name,
        currency: variant.currency,
        sku: variant.sku,
        price: calculateDiscount(
          Number(variant.price),
          variant.discounts as Discount[],
        ).finalPrice,
        quantity: quantity,
      })
    } catch {
      toast.error('Error adding item to cart')
    } finally {
      setLoading(false)
    }
  }

  const price = calculateDiscount(
    Number(variant.price),
    variant.discounts as Discount[],
  )

  return (
    <div className={cn(className, 'space-y-4')}>
      <section>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary">
            {product.name}
          </h2>
          <div className="flex items-center gap-2">
            <Link href={`/shop/`}>
              <Button variant="naked" color="primary">
                <Undo2 size={24} />
              </Button>
            </Link>
            <ShareButton
              title={product.name}
              text={product.description || ''}
              url={`${process.env.NEXT_PUBLIC_APP_URL}/shop/${product.slug}`}
            />
            <FavouriteButton productId={product.id} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {product.categories.map((category: Category) => (
            <Text key={category.id} variant="subHeading">
              {category.name}
            </Text>
          ))}
          {variant.stock > 0 && variant.stock < 3 && (
            <div className="text-red font-bold animate-pulse text-sm">
              • Only {variant.stock} left!
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <Text variant="sectionHeading">
          {price.hasDiscount ? (
            <div className="flex items-center gap-4 text-3xl sm:text-4xl font-semibold'">
              <span className="line-through opacity-40">
                {showCurrency[variant.currency as CurrencyCode]}
                {price.price.toFixed(2)}
              </span>
              <span>
                {showCurrency[variant.currency as CurrencyCode]}
                {price.finalPrice.toFixed(2)}
              </span>

              <span className="bg-green px-3 py-0.5 rounded-full items-center text-lg">
                SALE
              </span>
            </div>
          ) : (
            <div className="text-3xl sm:text-4xl  font-semibold">
              <span>
                {showCurrency[variant.currency as CurrencyCode]}
                {price.finalPrice.toFixed(2)}
              </span>
            </div>
          )}
        </Text>

        <ProductOptions product={product} setVariant={setVariant} />

        {!forSale ? (
          <div className="bg-red/20 px-10 py-2 text-center justify-center border border-red/60 items-center tracking-wide">
            <Text variant="bold" className={s.button}>
              OUT OF STOCK
            </Text>
            <Link href="/contacts">
              <Text className="underline text-secondary">
                Please contact us if you want to order this product
              </Text>
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex flex-row gap-4 items-center border border-border">
              <div className="flex h-16 flex-1 text-2xl font-semibold items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || remainingStock <= 0}
                  className="flex px-4 h-full  hover:bg-accent-1 transition items-center disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-6">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(remainingStock, quantity + 1))
                  }
                  disabled={quantity >= remainingStock || remainingStock <= 0}
                  className="flex px-4 h-full  hover:bg-accent-1 transition items-center disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <Button
                aria-label="Add to Cart"
                type="button"
                className={s.button}
                onClick={addToCart}
                loading={loading}
                disabled={!variant.availableForSale || remainingStock <= 0}
              >
                {remainingStock <= 0
                  ? 'OUT OF STOCK'
                  : variant?.availableForSale
                    ? 'Add To Cart'
                    : 'Not Available'}
              </Button>
            </div>
            {inCartQuantity > 0 && (
              <Text variant="muted" className="mt-2 text-sm">
                You have {inCartQuantity} of this item in your cart.{' '}
                {remainingStock > 0
                  ? `You can add ${remainingStock} more.`
                  : 'You have reached the stock limit.'}
              </Text>
            )}
            <Text variant="muted" className="mt-2">
              VAT included for UK orders. Duties and import taxes are calculated
              at checkout for other customers Shipping calculated at checkout.
            </Text>
          </div>
        )}
      </section>

      <Text className="wrap-break-word w-full max-w-xl text-justify leading-relaxed">
        {product.description ||
          'Because each ceramic piece is individually hand-made, you may notice slight variations in shape and size. These unique differences are what make every ceramic piece special and full of character.'}
      </Text>

      <section>
        <Collapse title={'Product Details'}>
          {!!variant.details && (
            <div className="space-y-2">
              {/* <Text variant="bold">Product details:</Text> */}

              <ul className="ml-2 space-y-1 mt-2">
                {(variant.details as Detail[]).map(
                  (detail: Detail, index: number) => (
                    <li
                      key={detail.title + index}
                      className="flex text-justify"
                    >
                      <Text className="font-semibold mr-1">
                        {detail.title}:{' '}
                      </Text>
                      <Text>{detail.description}</Text>
                    </li>
                  ),
                )}
              </ul>

              <Text className="text-justify">
                Because each ceramic piece is hand-made, you may notice slight
                variations in shape and size. These unique differences are what
                make every ceramic piece special and full of character.
              </Text>
            </div>
          )}
        </Collapse>

        <Collapse title={'How to love your uniquely made pottery'}>
          <Text className="text-justify leading-relaxed">
            To keep your ceramics looking their best, we recommend hand washing
            with warm, soapy water. While most pieces are dishwasher safe, hand
            washing helps preserve the unique glazes and finishes for years to
            come. Avoid sudden temperature changes to prevent thermal shock.
          </Text>
        </Collapse>

        <Collapse title={"Let's Stay Connected"}>
          <div className="space-y-4">
            <Text className="text-justify">
              I’d love to see how you style your pieces! Tag me on Instagram
              @curlypottery to share your photos, or enter your email below to
              get first notice of new collections and small-batch restocks.
            </Text>
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 bg-accent-1 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-secondary text-sm"
                />
                <Button variant="slim" className="whitespace-nowrap">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </Collapse>
      </section>
    </div>
  )
}

export default ProductSidebar
