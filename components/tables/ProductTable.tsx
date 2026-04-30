'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@components/ui'
import { useState } from 'react'
import DataTable from '@components/ui/Table/DataTable'
import { useRouter } from 'next/navigation'
import { cn } from '@lib/utils'
import { deleteProduct, toggleVisibility } from 'actions/product.actions'
import { ProductWithVariantsCategories, Variant } from '@lib/types/types'
import VariantTable from './VariantTable'
import { toast } from 'sonner'

export default function ProductTable({
  products,
}: {
  products: ProductWithVariantsCategories[]
}) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    setIsLoading(id)
    try {
      const productToDelete = products.find(
        (p: ProductWithVariantsCategories) => p.id === id,
      )!
      const images = productToDelete.variants.flatMap((v: Variant) => v.images)
      images.push(...productToDelete.images)

      const response = await deleteProduct({ id, images })
      if (response.success) {
        router.refresh()
      }
    } catch (error) {
      console.error('Delete failed', error)
      toast.error('Delete failed')
    } finally {
      setIsLoading(null)
    }
  }

  const handleToggleVisibility = async (id: string, hide: boolean) => {
    setIsLoading(id)
    try {
      const response = await toggleVisibility({ id, state: hide })
      if (response.success) {
        router.refresh()
      }
    } catch (error) {
      toast.error('Toggle visibility failed')

      console.error('Delete failed', error)
    } finally {
      setIsLoading(null)
    }
  }

  const productColumns = [
    {
      header: 'Image',

      render: (p: ProductWithVariantsCategories) => (
        <div className="flex justify-center ">
          <Image
            src={p.images[0] || '/placeholder.png'}
            alt={`${p.name} Image`}
            height={60}
            width={60}
            quality={85}
            style={{
              objectFit: 'contain',
            }}
            loading="lazy"
          />
        </div>
      ),
    },
    {
      header: 'Product',
      render: (p: ProductWithVariantsCategories) => (
        <div className="flex-1 min-w-24">
          <div className="font-medium">{p.name}</div>
          <div className="text-xs text-muted">{p.variants.length} variants</div>
        </div>
      ),
    },
    {
      header: 'Stock',
      render: (p: ProductWithVariantsCategories) => {
        const stock = p.variants.reduce(
          (acc: number, v: Variant) => acc + v.stock,
          0,
        )
        return (
          <span
            className={cn(
              'px-2 py-1 rounded font-bold',
              stock <= 2 ? 'bg-red/20 text-red' : 'bg-green/20 text-green',
            )}
          >
            {stock}
          </span>
        )
      },
    },
    {
      header: 'Price Range',
      render: (p: ProductWithVariantsCategories) => {
        const prices = p.variants.map((v: Variant) => Number(v.price))
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        return (
          <span>
            {minPrice === maxPrice
              ? `£${minPrice.toFixed(2)}`
              : `£${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)}`}
          </span>
        )
      },
    },
    {
      header: 'Last Update',
      render: (p: ProductWithVariantsCategories) => {
        return <span> {new Date(p.updatedAt).toLocaleDateString()}</span>
      },
    },
    {
      header: 'Actions',
      render: (p: ProductWithVariantsCategories) => (
        <div className="flex gap-2 justify-center">
          <Link href={`/admin/products/${p.id}`}>
            <Button
              variant="naked"
              aria-label={`Edit ${p.name}`}
              title={`Edit ${p.name}`}
            >
              <Pencil size={18} />
            </Button>
          </Link>
          <Button
            variant="naked"
            color="danger"
            disabled={!!isLoading}
            onClick={() => handleDelete(p.id, p.name)}
            aria-label={`Delete ${p.name}`}
            title={`Delete ${p.name}`}
          >
            <Trash2 size={18} />
          </Button>

          <Button
            variant="naked"
            color="warning"
            disabled={!!isLoading}
            aria-label={p.hide ? 'Show Product' : 'Hide Product'}
            title={p.hide ? 'Show Product' : 'Hide Product'}
            onClick={() => handleToggleVisibility(p.id, p.hide)}
          >
            {p.hide ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={products}
      columns={productColumns}
      renderExpansion={(product) => (
        <VariantTable variants={product.variants} />
      )}
    />
  )
}
