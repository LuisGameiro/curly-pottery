import { memo } from 'react'
import { Swatch } from '@components/product'
import type { ProductOption } from '@lib/types/inspiration/product'
import { SelectedOptions } from '../helpers'
import { Product, ProductVariant } from 'prisma/generated/prisma/client'

interface ProductOptionsProps {
  product: Product
  variant: ProductVariant
  setVariant: (variant: ProductVariant) => void
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  product,
  variant,
  setVariant,
}) => {
  return (
    <div>
      {product.variants.map((opt) => (
        <div className="pb-4" key={opt.displayName}>
          <h2 className="uppercase font-medium text-sm tracking-wide">
            {opt.displayName}
          </h2>
          <div role="listbox" className="flex flex-row py-4">
            {opt.values.map((v, i: number) => {
              const active = selectedOptions[opt.displayName.toLowerCase()]
              return (
                <Swatch
                  key={`${opt.id}-${i}`}
                  active={v.label.toLowerCase() === active}
                  variant={opt.displayName}
                  color={v.hexColors ? v.hexColors[0] : ''}
                  label={v.label}
                  onClick={() => {
                    setSelectedOptions((selectedOptions) => {
                      return {
                        ...selectedOptions,
                        [opt.displayName.toLowerCase()]: v.label.toLowerCase(),
                      }
                    })
                  }}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default memo(ProductOptions)
