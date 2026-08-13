'use client'

import { useEffect, useState } from 'react'
import { useToggleTheme } from '@lib/hooks/useToggleTheme'
import ThemeIcon from './ThemeIcon'
import { cn } from '@lib/utils'
import { ChevronRight } from 'lucide-react'
import { useClickOutside } from '@lib/hooks/useClickOutside'

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const [display, setDisplay] = useState(false)
  const { theme, themes, setTheme } = useToggleTheme()
  const menuId = 'theme-switcher-menu'
  const containerRef = useClickOutside<HTMLDivElement>(() => {
    setDisplay(false)
  }, display)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  if (mounted) {
    return (
      <div ref={containerRef} className="relative">
        <div className="flex items-center relative">
          <button
            type="button"
            className={`flex items-center justify-between w-[125px] h-10 pl-2 pr-1 text-on-primary rounded-md border border-border
              hover:border-on-primary/60 hover:text-on-primary/60 hover:bg-primary/60 hover:shadow-xs transition-colors ease-linear duration-150
              focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2`}
            aria-label="Theme Switcher"
            aria-expanded={display}
            aria-haspopup="menu"
            aria-controls={menuId}
            onClick={() => setDisplay((current) => !current)}
          >
            <span className="flex shrink items-center">
              <ThemeIcon width={20} height={20} theme={theme} />
              <span className={cn('capitalize ml-2')}>{theme}</span>
            </span>
            <span className="cursor-pointer">
              <ChevronRight
                className={cn('transition duration-300', {
                  ['rotate-90']: display,
                })}
              />
            </span>
          </button>
        </div>

        {/* Menu  */}
        <div className="absolute top-0 right-0 ">
          {themes.length && display ? (
            <div
              id={menuId}
              role="menu"
              className={
                'shadow-lg right-0 bottom-2 py-2 origin-top-right z-40 absolute border border-border w-[125px] h-auto bg-background rounded-md'
              }
            >
              <ul>
                {themes.map((t: string) => (
                  <li key={t}>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={theme === t}
                      className="flex w-full capitalize cursor-pointer px-6 py-1 transition ease-in-out duration-150 text-secondary leading-6 font-medium items-center hover:bg-accent-1 hover:text-secondary/60 focus-visible:outline-2 focus-visible:outline-secondary"
                      onClick={() => {
                        setTheme(t)
                        setDisplay(false)
                      }}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return null
}

export default ThemeSwitcher
