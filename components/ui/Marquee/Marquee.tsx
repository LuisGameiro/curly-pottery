'use client'

import { cn } from '@lib/utils'
import s from './Marquee.module.css'
import {
  ReactNode,
  Children,
  cloneElement,
  ReactElement,
  isValidElement,
} from 'react'
import { default as FastMarquee } from 'react-fast-marquee'

interface MarqueeProps {
  className?: string
  children?: ReactNode
}

const Marquee = ({ children = [], className = '' }: MarqueeProps) => {
  const rootClassName = cn(s.root, className)

  return (
    <FastMarquee gradient={false} className={rootClassName} autoFill={true}>
      {Children.map(children, (child: ReactNode) => {
        if (!isValidElement(child)) return child

        const element = child as ReactElement<{ className?: string }>

        return cloneElement(element, {
          className: cn(element.props.className),
        })
      })}
    </FastMarquee>
  )
}

export default Marquee
