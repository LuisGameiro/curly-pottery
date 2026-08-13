'use client'

import { cn } from '@lib/utils'
import s from './Marquee.module.css'
import {
  Children,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

interface MarqueeProps {
  className?: string
  children?: ReactNode
}

const SPEED = 1 // px advanced per frame while auto-scrolling
const GAP = 16 // gap-6 between cards
const PAD = 0 // px-3 leading padding of the original track
const BUFFER_PX = 480 // how far off-screen items are still rendered
const MIN_ITEM_SIZE = 250 // fallback while measuring (cards are 250x250)

// FlashList-style windowed marquee: instead of rendering every child (twice, as
// the old CSS version did), we render a virtual window of items around the
// current scroll offset and position them absolutely. The item sequence is
// repeated infinitely, so the marquee loops seamlessly forever without ever
// mounting the full list. Items are measured once on mount.
const Marquee = ({ children = [], className = 'mx-8' }: MarqueeProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureItemRefs = useRef<(HTMLDivElement | null)[]>([])
  const wrapperRefs = useRef(new Map<number, HTMLDivElement>())

  const childArray = Children.toArray(children)

  const [measured, setMeasured] = useState(false)
  const [spans, setSpans] = useState<number[]>([])
  const [height, setHeight] = useState(0)
  const [vRange, setVRange] = useState<[number, number] | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [cursor, setCursor] = useState('grab')
  const [prevCount, setPrevCount] = useState(childArray.length)

  const offsetRef = useRef(0)
  const isDragging = useRef(false)
  const activePointer = useRef<number | null>(null)
  const startX = useRef(0)
  const offsetStart = useRef(0)
  const dragDistance = useRef(0)
  const suppressClick = useRef(false)

  // Re-measure whenever the child count changes (render-phase adjustment)
  if (prevCount !== childArray.length) {
    setPrevCount(childArray.length)
    setMeasured(false)
    setSpans([])
  }

  // Measure the children once (and again whenever the child count changes).
  // Runs before paint, so the swap to the windowed track is invisible.
  useLayoutEffect(() => {
    const items = measureItemRefs.current
    if (!items.length) return
    const nextSpans = items.map((el) =>
      el ? el.offsetWidth + GAP : MIN_ITEM_SIZE,
    )
    const nextHeight = Math.max(
      ...items.map((el) => el?.offsetHeight || MIN_ITEM_SIZE),
    )
    setSpans(nextSpans)
    setHeight(nextHeight)
    setMeasured(true)
  }, [childArray.length])

  // Position of virtual item v in the infinite, seamless sequence.
  const posOf = useMemo(() => {
    const n = spans.length
    const prefix = [0]
    for (let i = 0; i < n; i++) prefix.push(prefix[i] + spans[i])
    const total = prefix[n]
    return (v: number) => {
      if (!n) return 0
      const k = Math.floor(v / n)
      const m = ((v % n) + n) % n
      return PAD + k * total + prefix[m]
    }
  }, [spans])

  // Position windowed items before paint (refs must not be read during render)
  useLayoutEffect(() => {
    for (const [v, el] of wrapperRefs.current) {
      const left = posOf(v) - offsetRef.current
      if (el.style.left !== `${left}px`) el.style.left = `${left}px`
    }
  }, [measured, vRange, posOf])

  // Pause rendering work when the marquee scrolls off-screen
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

  // Respect reduced-motion: no auto-scroll, wheel/drag still work
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Mouse wheel scrolls the marquee horizontally (FlashList-style)
  useEffect(() => {
    const container = containerRef.current
    if (!container || !measured) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      offsetRef.current += e.deltaMode === 1 ? raw * 16 : raw
    }

    // Non-passive so we can stop the page from scrolling instead
    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [measured])

  // Animation loop: advance the virtual offset, recompute the visible window,
  // and position items directly on the DOM (no React re-render per frame).
  useEffect(() => {
    const container = containerRef.current
    if (!container || !measured || !spans.length) return

    const n = spans.length
    const total = posOf(n) - PAD
    const avgSpan = total / n

    let range: [number, number] | null = null
    let raf = 0

    const update = () => {
      if (!isVisible) return
      const o = offsetRef.current
      const viewport = container.clientWidth

      // Expand the virtual item range until it covers the viewport + buffer
      let vMin = Math.floor(o / avgSpan)
      while (posOf(vMin) + spans[((vMin % n) + n) % n] > o - BUFFER_PX) vMin--
      let vMax = Math.floor(o / avgSpan)
      while (posOf(vMax) < o + viewport + BUFFER_PX) vMax++

      if (!range || range[0] !== vMin || range[1] !== vMax) {
        range = [vMin, vMax]
        setVRange(range)
      }

      // Glide items by mutating style.left directly
      for (const [v, el] of wrapperRefs.current) {
        const left = posOf(v) - o
        if (el.style.left !== `${left}px`) el.style.left = `${left}px`
      }
    }

    const tick = () => {
      if (!reducedMotion && isVisible && !isHovered && !isDragging.current) {
        offsetRef.current += SPEED
      }
      update()
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [measured, spans, posOf, isVisible, isHovered, reducedMotion])

  // All hooks above must run unconditionally — return after them.
  if (!childArray.length) return null

  // Unified drag for mouse, touch and pen. Horizontal swipes drag the marquee;
  // vertical swipes are left to the browser (touch-action: pan-y).
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !measured) return
    if (activePointer.current !== null) return // ignore extra fingers
    activePointer.current = e.pointerId
    if (e.pointerType === 'mouse') e.preventDefault() // stop native image/link drag
    isDragging.current = true
    dragDistance.current = 0
    suppressClick.current = false
    setCursor('grabbing')
    containerRef.current?.setPointerCapture(e.pointerId)
    startX.current = e.clientX
    offsetStart.current = offsetRef.current
    setIsHovered(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || e.pointerId !== activePointer.current) return
    const walk = e.clientX - startX.current
    dragDistance.current = Math.max(dragDistance.current, Math.abs(walk))
    offsetRef.current = offsetStart.current - walk
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== activePointer.current) return
    activePointer.current = null
    // A drag ends with a click on the card underneath - swallow it
    if (isDragging.current && dragDistance.current > 5) {
      suppressClick.current = true
    }
    isDragging.current = false
    setCursor('grab')
    if (e.pointerType !== 'mouse') setIsHovered(false)
  }

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (e.pointerId !== activePointer.current) return
    activePointer.current = null
    isDragging.current = false
    suppressClick.current = false
    setCursor('grab')
    setIsHovered(false)
  }

  const handleMouseLeave = () => {
    isDragging.current = false
    suppressClick.current = false
    setCursor('grab')
    setIsHovered(false)
  }

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      e.preventDefault()
      e.stopPropagation()
      suppressClick.current = false
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(s.root, 'select-none', className)}
      style={{
        height: height || undefined,
        cursor: cursor,

      }}
      data-testid="categories-marquee"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
    >
      {!measured && (
        <div
          aria-hidden
          className="invisible absolute left-0 top-0 flex "
        >
          {childArray.map((child, i) => (
            <div
              key={i}
              ref={(el) => {
                measureItemRefs.current[i] = el
              }}
              className="shrink-0"
            >
              {child}
            </div>
          ))}
        </div>
      )}

      {measured && vRange && (
        <div className="absolute inset-y-0 left-0">
          {Array.from({ length: vRange[1] - vRange[0] + 1 }, (_, i) => {
            const v = vRange[0] + i
            const m = ((v % spans.length) + spans.length) % spans.length
            return (
              <div
                key={v}
                ref={(el) => {
                  if (el) wrapperRefs.current.set(v, el)
                  else wrapperRefs.current.delete(v)
                }}
                className="absolute top-0 h-full"
                style={{
                  left: 0,
                  width: spans[m],
                }}
              >
                {childArray[m]}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Marquee
