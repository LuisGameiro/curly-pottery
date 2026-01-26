import { useState } from 'react'
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
    router.replace(`/shop?category=${activeCategory || ''}&sort=${key}`)
  }

  const containerSortRef = useClickOutside<HTMLDivElement>(() => {
    setOpenSort(!false)
  }, openSort)

  const containerFilterRef = useClickOutside<HTMLDivElement>(() => {
    setOpenFilter(false)
  }, openFilter)

  return (
    <aside className="gap-2 lg:col-span-3 flex flex-col sm:flex-row lg:flex-col">
      <div className="relative w-full ">
        <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1 mb-1 block">
          Sort by
        </label>

        <div ref={containerSortRef} className="z-30">
          <button
            className="w-full bg-accent-1 text-base border-2 border-border px-4 py-3 rounded-lg font-semibold flex justify-between items-center hover:bg-background transition-colors lg:cursor-default lg:hover:bg-accent-1 lg:hidden"
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
              'absolute left-0 right-0 top-full space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl  transition-all',
              'lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block lg:static z-50',
              { hidden: !openSort },
            )}
          >
            {Object.entries(sortLabels).map(([key, label]) => (
              <li
                key={key}
                className={cn(
                  'px-4 py-2 rounded-md cursor-pointer transition-colors flex items-center justify-between',
                  sortMethod === key
                    ? 'bg-secondary text-background font-bold'
                    : 'hover:bg-accent-1 font-medium',
                )}
                onClick={() => {
                  handleSortMethodChange(key)
                }}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative w-full">
        <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1 mb-1 block">
          Browse
        </label>

        <div ref={containerFilterRef} className="z-30">
          <button
            className="w-full bg-accent-1 text-base border-2 border-border px-4 py-3 rounded-lg font-semibold flex justify-between items-center hover:bg-background transition-colors lg:cursor-default lg:hover:bg-accent-1 lg:hidden"
            onClick={() => setOpenFilter((v) => !v)}
          >
            <span>{activeCategory || 'All Categories'}</span>
            <ChevronUp
              size={18}
              className={cn('transition-transform', openFilter && 'rotate-180')}
            />
          </button>
          <ul
            className={cn(
              'absolute left-0 right-0 top-full space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl  transition-all',
              'lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block lg:static z-50',
              { hidden: !openFilter },
            )}
          >
            <li
              className={cn(
                'px-4 py-2 rounded-md cursor-pointer transition-colors flex items-center justify-between',
                !activeCategory
                  ? 'bg-secondary text-background font-bold'
                  : 'hover:bg-accent-1 font-medium',
              )}
              onClick={() => handleCategoryChange()}
            >
              All Products
            </li>

            {categories.map((cat: Category) => (
              <li
                key={cat.id}
                className={cn(
                  'px-4 py-2 rounded-md cursor-pointer transition-colors flex items-center justify-between',
                  activeCategory === cat.name || activeCategory === cat.slug
                    ? 'bg-secondary text-background font-bold'
                    : 'hover:bg-accent-1 font-medium',
                )}
                onClick={() => handleCategoryChange(cat.slug)}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
