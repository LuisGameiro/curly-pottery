'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import cn from 'clsx'
import s from './SearchBar.module.css'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  className?: string
  id?: string
}

export default function SearchBar({
  className,
  id = 'search',
}: SearchBarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const mobileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [isOpen])

  const handleSearch = (q: string) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, q: string) => {
    if (e.key === 'Enter') {
      handleSearch(q)
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <>
      <div className={cn(s.root, className)}>
        <label className="hidden" htmlFor={id}>
          Search
        </label>
        <input
          id={id}
          className={cn(s.input, 'hidden md:block')}
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={(e) => handleKeyUp(e, query)}
        />
        <button
          type="button"
          className={cn(s.iconContainer, 'md:hidden relative inset-auto p-2')}
          aria-label="Open search"
          onClick={() => setIsOpen(true)}
        >
          <Search size={24} className="text-secondary" />
        </button>
        <div className={cn(s.iconContainer, 'hidden md:flex')}>
          <svg className={s.icon} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className={s.mobileOverlay}>
          <div className={s.mobileSearchContainer}>
            <div className={s.mobileSearchBar}>
              <Search size={20} className="text-muted" />
              <input
                ref={mobileInputRef}
                type="text"
                className={s.mobileInput}
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={(e) => handleKeyUp(e, query)}
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setIsOpen(false)
                  setQuery('')
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
