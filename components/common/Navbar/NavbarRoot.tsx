import { FC, useState, useEffect, ReactNode, useRef } from 'react'
import throttle from 'lodash.throttle'
import cn from 'clsx'
import s from './Navbar.module.css'

const NavbarRoot: FC<{ children?: ReactNode }> = ({ children }) => {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollTop = useRef(0)

  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollTop = document.documentElement.scrollTop

      // Shadow logic
      setHasScrolled(scrollTop > 0)

      // Hide-on-scroll-down logic
      if (scrollTop > lastScrollTop.current && scrollTop > 80) {
        setHidden(true) // scrolling down
      } else {
        setHidden(false) // scrolling up
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
        s.root,
        { 'shadow-magical': hasScrolled },
        { [s.hidden]: hidden }
      )}
    >
      {children}
    </div>
  )
}

export default NavbarRoot
