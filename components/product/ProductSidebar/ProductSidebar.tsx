import s from './ProductSidebar.module.css'
// import { useAddItem } from '@framework/cart'
import { FC, useEffect, useState } from 'react'
import { ProductOptions } from '@components/product'
import type { Product } from '@lib/types/product'
import { Button, Text, Rating, Collapse, useUI } from '@components/ui'
import {
  getProductVariant,
  selectDefaultOptionFromProduct,
  SelectedOptions,
} from '../helpers'
import ErrorMessage from '@components/ui/ErrorMessage'
import Link from 'next/link'
import { cn } from '@lib/utils'

interface ProductSidebarProps {
  product: Product
  className?: string
}

const ProductSidebar: FC<ProductSidebarProps> = ({ product, className }) => {
  // const addItem = useAddItem()
  const addItem = async ({productId,variantId}:{productId:string,variantId:string})=>{new Promise(()=>{})}
  const { openSidebar, setSidebarView } = useUI()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | Error>(null)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})

  useEffect(() => {
    selectDefaultOptionFromProduct(product, setSelectedOptions)
  }, [product])

  const variant = getProductVariant(product, selectedOptions)
  const addToCart = async () => {
    setLoading(true)
    setError(null)
    try {
      await addItem({
        productId: String(product.id),
        variantId: String(variant ? variant.id : product.variants[0]?.id),
      })
      setSidebarView('CART_VIEW')
      openSidebar()
      setLoading(false)
    } catch (err) {
      setLoading(false)
      if (err instanceof Error) {
        console.error(err)
        setError({
          ...err,
          message: 'Could not add item to cart. Please try again.',
        })
      }
    }
  }

  return (
    <div className={className}>
      {/* button to add cart */}

      {product?.stock === 0 || !product.availableForSale ?
        <div className='bg-destructive text-accent-0 cursor-pointer 
  px-10 py-3 leading-6 transition ease-in-out duration-150
  shadow-sm text-center justify-center 
  border border-transparent items-center text-sm font-semibold
  tracking-wide'>
          <h3 className='' >OUT OF STOCK</h3>
          <Link   href='/contacts'>Please contact us if you want to order this product</Link>
        </div>      :
        <Button
            aria-label="Add to Cart"
            type="button"
            className={s.button}
            onClick={addToCart}
            loading={loading}
            disabled={variant?.availableForSale === false}
          >
            {variant?.availableForSale === false
              ? 'Not Available'
              : 'Add To Cart'}
          </Button>
      }

      {/* <ProductOptions
        options={product.options}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      /> */}

      <Text
        className="py-2 wrap-break-word w-full max-w-xl "
        html={product.descriptionHtml || product.description}
      />

      {/*Extra info */}
      <div >
        {product?.glazes &&
        <Collapse title="glaze">
          {product?.glazes.map(g=><p>g</p>) }
        </Collapse>}

         <Collapse title="dimensions">
            All product are handmade so all products have some variation.
           {product?.dimensions?.width && <p>width: {product?.dimensions?.width }</p>}
           {product?.dimensions?.width && <p>depth: {product?.dimensions?.depth }</p>}
           {product?.dimensions?.width && <p> height: {product?.dimensions?.height }</p>}

        </Collapse>
      </div>
    </div>
  )
}

export default ProductSidebar
