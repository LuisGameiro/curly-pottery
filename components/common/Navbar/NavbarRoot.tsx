'use client'

import { useState, useEffect, ReactNode, useRef } from 'react'
import throttle from 'lodash.throttle'
// Removed CSS module import
import { cn } from '@lib/utils'

const NavbarRoot = ({ children }: { children?: ReactNode }) => {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollTop = useRef(0)

  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollTop = document.documentElement.scrollTop

      setHasScrolled(scrollTop > 0)

      if (scrollTop > lastScrollTop.current && scrollTop > 80) {
        setHidden(true)
      } else {
        setHidden(false)
      }

      lastScrollTop.current = scrollTop
    }, 200)

    document.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      document.removeEventListener('scroll', handleScroll)
      handleScroll.cancel()
    }
  }, [])

  return (
    <div
      className={cn(
        'sticky top-0 bg-primary z-40 transition-all duration-150 min-h-[34px] h-20',
        { 'shadow-magical': hasScrolled },
        { 'transform -translate-y-full': hidden },
      )}
    >
      {children}
    </div>
  )
}

export default NavbarRoot
