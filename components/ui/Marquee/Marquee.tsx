'use client'

import { cn } from '@lib/utils'
import s from './Marquee.module.css'
import {
  ReactNode,
  Children,
  cloneElement,
  ReactElement,
  isValidElement,
  useRef,
  useEffect,
  useState,
} from 'react'

interface MarqueeProps {
  className?: string
  children?: ReactNode
}

const Marquee = ({ children = [], className = '' }: MarqueeProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const [cursor, setCursor] = useState('grab')

  // Pause the animation loop when the marquee scrolls off-screen
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Detect if content overflows the container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const checkOverflow = () => {
      setIsOverflowing(container.scrollWidth > container.clientWidth)
    }

    checkOverflow()

    const observer = new ResizeObserver(checkOverflow)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || isOverflowing) return

    let animationId: number

    const scroll = () => {
      if (!isVisible) return

      if (!isHovered && !isDragging.current) {
        container.scrollLeft += 1

        // Seamless loop condition
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationId)
  }, [isHovered, isVisible, isOverflowing])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    setCursor('grabbing')
    startX.current = e.pageX - (containerRef.current?.offsetLeft || 0)
    scrollLeftStart.current = containerRef.current?.scrollLeft || 0
  }

  const handleMouseLeave = () => {
    isDragging.current = false
    setCursor('grab')
    setIsHovered(false)
  }

  const handleMouseUp = () => {
    isDragging.current = false
    setCursor('grab')
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    e.preventDefault()
    const x = e.pageX - (containerRef.current?.offsetLeft || 0)
    const walk = (x - startX.current) * 2
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeftStart.current - walk
    }
  }

  const renderedChildren = Children.map(children, (child: ReactNode) => {
    if (!isValidElement(child)) return child
    const element = child as ReactElement<{ className?: string }>
    return cloneElement(element, {
      className: cn(element.props.className),
    })
  })

  return (
    <div
      ref={containerRef}
      className={cn(
        s.root,
        'flex whitespace-nowrap select-none',
        isOverflowing ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden',
        className,
      )}
      style={{
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        cursor: isOverflowing ? cursor : 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={isOverflowing ? handleMouseDown : undefined}
      onMouseUp={isOverflowing ? handleMouseUp : undefined}
      onMouseMove={isOverflowing ? handleMouseMove : undefined}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      data-testid="categories-marquee"
    >
      {isOverflowing ? (
        <div className="flex shrink-0 gap-6 px-3">{renderedChildren}</div>
      ) : (
        <div className={`flex ${s.autoScroll} ${isHovered ? s.paused : ''}`}>
          <div className="flex shrink-0 gap-6 px-3">{renderedChildren}</div>
          <div className="flex shrink-0 gap-6 px-3">{renderedChildren}</div>
        </div>
      )}
    </div>
  )
}

export default Marquee
