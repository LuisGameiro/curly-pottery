import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@lib/utils'
import { ChevronUp } from 'lucide-react'
import { Category } from '@lib/types/types'
import { useClickOutside } from '@lib/hooks/useClickOutside'
import { sortLabels, SortLabels } from './sortProducts'

interface MenuProductsProps {
  sortMethod: SortLabels
  categories: Category[]
  activeCategory: string | null
  productCount: number
}

export default function MenuProducts({
  sortMethod,
  categories,
  activeCategory,
  productCount,
}: MenuProductsProps) {
  const router = useRouter()

  const [openFilter, setOpenFilter] = useState(false)
  const [openSort, setOpenSort] = useState(false)

  const handleCategoryChange = (slug?: string) => {
    setOpenFilter(false)
    if (slug) {
      router.push(`/shop?category=${slug}`)
    } else {
      router.push(`/shop`)
    }
  }

  const handleSortMethodChange = (key: SortLabels) => {
    setOpenSort(false)
    router.replace(`/shop?category=${activeCategory || ''}&sort=${key}`)
  }

  const containerSortRef = useClickOutside<HTMLDivElement>(() => {
    setOpenSort(false)
  }, openSort)

  const containerFilterRef = useClickOutside<HTMLDivElement>(() => {
    setOpenFilter(false)
  }, openFilter)

  return (
    <div className="flex  items-center gap-4  ">
      <div className="relative" ref={containerFilterRef}>
        <button
          className="rounded-full px-2 py-0.5 font-bold text-secondary flex items-center gap-2 hover:bg-primary transition-colors"
          onClick={() => setOpenFilter((v) => !v)}
        >
          <Image src="/Filter.svg" alt="Filter" width={16} height={16} />
          Filters
        </button>
        <ul
          className={cn(
            'absolute left-0 top-full mt-2 p-2 bg-white border-2 border-secondary rounded-2xl shadow-xl min-w-[200px] z-50 transition-all',
            { hidden: !openFilter },
          )}
        >
          <li
            className={cn(
              'px-4 py-2 rounded-lg cursor-pointer transition-colors',
              !activeCategory
                ? 'bg-secondary text-white font-bold'
                : 'hover:bg-primary',
            )}
            onClick={() => handleCategoryChange()}
          >
            All Products
          </li>
          {categories.map((cat: Category) => (
            <li
              key={cat.id}
              className={cn(
                'px-4 py-2 rounded-lg cursor-pointer transition-colors',
                activeCategory === cat.slug
                  ? 'bg-secondary text-white font-bold'
                  : 'hover:bg-primary',
              )}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex  ml-auto justify-end items-center">
        <div className="text-secondary font-bold text-sm">
          {productCount} {productCount === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="relative flex items-center gap-4" ref={containerSortRef}>
        {/* Item count will be handled by ProductList but we can leave a gap here if needed */}
        <div className="relative">
          <button
            className="rounded-full px-2 py-0.5 font-bold text-secondary flex items-center gap-2 hover:bg-primary transition-colors justify-between"
            onClick={() => setOpenSort((v) => !v)}
          >
            <span>{sortLabels[sortMethod]}</span>
            <ChevronUp
              size={18}
              className={cn('transition-transform', openSort && 'rotate-180')}
            />
          </button>
          <ul
            className={cn(
              'absolute right-0 top-full mt-2 p-2 bg-white border-2 border-secondary rounded-2xl shadow-xl min-w-[200px] z-50 transition-all',
              { hidden: !openSort },
            )}
          >
            {Object.entries(sortLabels).map(([key, label]) => (
              <li
                key={key}
                className={cn(
                  'px-4 py-2 rounded-lg cursor-pointer transition-colors',
                  sortMethod === key
                    ? 'bg-secondary text-white font-bold'
                    : 'hover:bg-primary',
                )}
                onClick={() => handleSortMethodChange(key as SortLabels)}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
