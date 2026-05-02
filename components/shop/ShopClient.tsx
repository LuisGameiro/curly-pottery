'use client'

import { Category } from '@lib/types/types'
import MenuProducts from './MenuProducts'
import { SortLabels } from './sortProducts'

interface ShopClientProps {
  sortMethod: SortLabels
  categories: Category[]
  activeCategory: string | null
  productCount: number
  children: React.ReactNode
}

export default function ShopClient({
  sortMethod,
  categories,
  activeCategory,
  productCount,
  children,
}: ShopClientProps) {
  return (
    <main className="relative h-full flex-1 bg-linear-to-r from-background to-accent-2 py-4 lg:py-8 px-4 lg:px-8">
      <div className="mb-8 lg:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Welcome to My Shop
        </h1>
        <p className="text-muted text-base md:text-lg max-w-3xl leading-relaxed">
          Discover unique handcrafted pottery and ceramics. Each piece is
          carefully crafted with love, bringing warmth and artistry to your
          home.
        </p>
      </div>

      <div className="flex flex-col">
        <MenuProducts
          sortMethod={sortMethod}
          categories={categories}
          activeCategory={activeCategory}
          productCount={productCount}
        />
        <section className="w-full">{children}</section>
      </div>
    </main>
  )
}
