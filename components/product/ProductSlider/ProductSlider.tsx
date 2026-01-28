'use client'

import { useKeenSlider } from 'keen-slider/react'
import React, {
  Children,
  isValidElement,
  useState,
  useRef,
  useEffect,
} from 'react'
import { a } from '@react-spring/web'
import s from './ProductSlider.module.css'
import ProductSliderControl from '../ProductSliderControl'
import { cn } from '@lib/utils'

interface ProductSliderProps {
  children?: React.ReactNode[]
  className?: string
}

const ProductSlider = ({ children, className = '' }: ProductSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const sliderContainerRef = useRef<HTMLDivElement>(null)
  const thumbsContainerRef = useRef<HTMLDivElement>(null)

  const [ref, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    created: () => setIsMounted(true),
    drag: true,
    rubberband: true,
    slideChanged(s) {
      const slideNumber = s.track.details.rel
      setCurrentSlide(slideNumber)

      if (thumbsContainerRef.current) {
        const $el = document.getElementById(`thumb-${slideNumber}`)
        if ($el) {
          thumbsContainerRef.current.scrollTo({
            left:
              $el.offsetLeft -
              thumbsContainerRef.current.offsetWidth / 2 +
              $el.offsetWidth / 2,
            behavior: 'smooth',
          })
        }
      }
    },
  })

  const [thumbnailRef] = useKeenSlider<HTMLDivElement>({
    vertical: false,
    slides: {
      perView: 3,
      spacing: 0,
    },
    loop: true,
    drag: true,
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 4, spacing: 0 },
      },
      '(min-width: 1280px)': {
        slides: { perView: 5, spacing: 0 },
      },
      '(min-width: 1536px)': {
        slides: { perView: 6, spacing: 0 },
      },
    },
  })

  useEffect(() => {
    const preventNavigation = (event: TouchEvent) => {
      const touchXPosition = event.touches[0].pageX
      const touchXRadius = event.touches[0].radiusX || 0

      if (
        touchXPosition - touchXRadius < 10 ||
        touchXPosition + touchXRadius > window.innerWidth - 10
      )
        event.preventDefault()
    }

    const slider = sliderContainerRef.current!

    slider.addEventListener('touchstart', preventNavigation, { passive: true })

    return () => {
      if (slider) {
        slider.removeEventListener('touchstart', preventNavigation)
      }
    }
  }, [])

  const onPrev = () => slider.current?.prev()
  const onNext = () => slider.current?.next()
  return (
    <div className={cn(s.root, className)} ref={sliderContainerRef}>
      <div
        ref={ref}
        className={cn(s.slider, { [s.show]: isMounted }, 'keen-slider')}
      >
        {slider && <ProductSliderControl onPrev={onPrev} onNext={onNext} />}
        {Children.map(children, (child) => {
          if (isValidElement<HTMLElement>(child)) {
            return {
              ...child,
              props: {
                ...child.props,
                className: `keen-slider__slide object-contain sm:max-h-[calc(100vh-274px)] sm:max-w-[calc(100vh-274px)]`,
              },
            }
          }
          return child
        })}
      </div>

      <a.div className={cn(s.album, 'keen-slider')} ref={thumbnailRef}>
        {slider &&
          Children.map(children, (child, idx) => {
            if (isValidElement<HTMLElement>(child)) {
              return {
                ...child,
                props: {
                  ...child.props,
                  className: cn(
                    child.props.className,
                    s.thumb,
                    'keen-slider__slide',
                    {
                      [s.selected]: currentSlide === idx,
                    },
                  ),
                  id: `thumb-${idx}`,
                  onClick: () => {
                    slider.current?.moveToIdx(idx)
                  },
                },
              }
            }
            return child
          })}
      </a.div>
    </div>
  )
}

export default ProductSlider
