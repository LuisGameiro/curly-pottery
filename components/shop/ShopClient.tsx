'use client'

import { Category } from '@lib/types/types'
import MenuProducts from './MenuProducts'
import { SortLabels } from './sortProducts'

interface ShopClientProps {
  sortMethod: SortLabels
  categories: Category[]
  activeCategory: string | null
  children: React.ReactNode
}

export default function ShopClient({
  sortMethod,
  categories,
  activeCategory,
  children,
}: ShopClientProps) {
  return (
    <main className="relative h-full flex-1 bg-linear-to-r from-background to-accent-2 py-4 lg:py-8 px-4 lg:px-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <MenuProducts
          sortMethod={sortMethod}
          categories={categories}
          activeCategory={activeCategory}
        />
        <section className=" col-span-1 lg:col-span-9">{children}</section>
      </div>
    </main>
  )
}
