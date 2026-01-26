'use client'

import DataTable from '@components/ui/Table/DataTable'
import { Variant } from '@lib/types/types'

export default function VariantTable({ variants }: { variants: Variant[] }) {
  const variantColumns = [
    {
      header: 'SKU',
      render: (v: Variant) => <span className="text-secondary uppercase">{v.sku}</span>,
    },
    {
      header: 'Size / Color',
      render: (v: Variant) => (
        <span className='capitalize'>
          {v.sizeName} {v.colorName && `• ${v.colorName}`}
        </span>
      ),
    },
    {
      header: 'Price',
      align: 'center' as const,
      render: (v: Variant) => `£${v.price.toFixed(2)}`,
    },
    {
      header: 'Stock',
      align: 'center' as const,
      render: (v: Variant) => v.stock,
    },
    {
      header: 'Discount',
      align: 'center' as const,
      render: (v: Variant) => (v.discounts ? 'Active' : 'None'),
    },
    {
      header: 'Status',
      align: 'center' as const,
      render: (v: Variant) => (
        <span className={v.availableForSale ? 'text-green' : 'text-muted'}>
          {v.availableForSale ? 'Active' : 'Hidden'}
        </span>
      ),
    },
  ]
  return (
    <DataTable<Variant & { id: string }>
      data={variants}
      columns={variantColumns}
    />
  )
}
