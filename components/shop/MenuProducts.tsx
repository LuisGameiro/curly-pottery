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
}

export default function MenuProducts({
  sortMethod,
  categories,
  activeCategory,
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
    const query = activeCategory
      ? `category=${activeCategory}&sort=${key}`
      : `sort=${key}`
    router.replace(`/shop?${query}`)
  }

  const containerSortRef = useClickOutside<HTMLDivElement>(() => {
    setOpenSort(false)
  }, openSort)

  const containerFilterRef = useClickOutside<HTMLDivElement>(() => {
    setOpenFilter(false)
  }, openFilter)

  return (
    <div className="flex  items-center gap-4  ">
      <div className="relative p-1" ref={containerFilterRef}>
        <button
          className="rounded-full px-3 py-0.5 font-bold text-secondary flex items-center gap-2 hover:bg-primary transition-colors"
          onClick={() => setOpenFilter((v) => !v)}
          aria-expanded={openFilter}
          aria-haspopup="menu"
          data-testid="filter-button"
        >
          <Image src="/Filter.svg" alt="Filter" width={16} height={16} />
          Filters
        </button>
        <ul
          className={cn(
            'absolute left-0 top-full mt-2 p-2 bg-background border-2 border-secondary rounded-2xl shadow-xl min-w-[200px] z-60 transition-all',
            { hidden: !openFilter },
          )}
          role="menu"
        >
          <li>
            <button
              type="button"
              role="menuitem"
              className={cn(
                'w-full text-left px-4 py-2 rounded-lg transition-colors',
                !activeCategory
                  ? 'bg-secondary text-primary font-bold'
                  : 'hover:bg-primary',
              )}
              onClick={() => handleCategoryChange()}
            >
              All Products
            </button>
          </li>
          {categories.map((cat: Category) => (
            <li key={cat.id}>
              <button
                type="button"
                role="menuitem"
                className={cn(
                  'w-full text-left px-4 py-2 rounded-lg transition-colors',
                  activeCategory === cat.slug
                    ? 'bg-secondary text-primary font-bold'
                    : 'hover:bg-primary',
                )}
                onClick={() => handleCategoryChange(cat.slug)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="ml-auto flex flex-col items-end gap-1">
        <div className="relative flex items-center p-1" ref={containerSortRef}>
          {/* Item count will be handled by ProductList but we can leave a gap here if needed */}
          <div className="relative">
            <button
              className="rounded-full px-3 py-0.5 font-bold text-secondary flex items-center gap-2 hover:bg-primary transition-colors justify-between"
              onClick={() => setOpenSort((v) => !v)}
              aria-expanded={openSort}
              aria-haspopup="menu"
              data-testid="sort-button"
            >
              <span>{sortLabels[sortMethod]}</span>
              <ChevronUp
                size={18}
                className={cn('transition-transform', openSort && 'rotate-180')}
              />
            </button>
            <ul
              className={cn(
                'absolute right-0 top-full mt-2 p-2 bg-background border-2 border-secondary rounded-2xl shadow-xl min-w-[200px] z-60 transition-all',
                { hidden: !openSort },
              )}
              role="menu"
            >
              {Object.entries(sortLabels).map(([key, label]) => (
                <li key={key}>
                  <button
                    type="button"
                    role="menuitem"
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg transition-colors',
                      sortMethod === key
                        ? 'bg-secondary text-primary font-bold'
                        : 'hover:bg-primary',
                    )}
                    onClick={() => handleSortMethodChange(key as SortLabels)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
