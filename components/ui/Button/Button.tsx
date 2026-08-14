'use client'

import React, { forwardRef, ButtonHTMLAttributes, useRef } from 'react'
import { mergeRefs } from 'react-merge-refs'
import s from './Button.module.css'
import { LoadingDots } from '@components/ui'
import { cn } from '@lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  className?: string
  variant?: 'flat' | 'slim' | 'ghost' | 'naked' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'danger' | 'success' | 'warning' | 'secondary'
  active?: boolean
  type?: 'submit' | 'reset' | 'button'
  width?: string | number
  loading?: boolean
  disabled?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props: ButtonProps, buttonRef) => {
    const {
      className,
      variant = 'flat',
      size = 'md',
      color = 'primary',
      children,
      active,
      width,
      loading = false,
      disabled = false,
      style = {},
      ...rest
    } = props

    const ref = useRef<HTMLButtonElement>(null)

    const rootClassName = cn(
      s.root,
      {
        [s.ghost]: variant === 'ghost',
        [s.slim]: variant === 'slim',
        [s.naked]: variant === 'naked',
        // Map sizes
        [s.sm]: size === 'sm',
        [s.lg]: size === 'lg',
        // Map colors
        [s.secondary]: color === 'secondary',
        [s.danger]: color === 'danger',
        [s.success]: color === 'success',
        [s.warning]: color === 'warning',
        [s.loading]: loading,
        [s.disabled]: disabled,
      },
      className,
    )

    return (
      <button
        aria-pressed={active}
        data-variant={variant}
        data-size={size}
        data-color={color}
        ref={mergeRefs([ref, buttonRef])}
        className={rootClassName}
        disabled={loading || disabled}
        data-testid={`button-${variant || 'default'}`}
        style={{
          width,
          ...style,
        }}
        {...rest}
      >
        {children}
        {loading && (
          <i className="pl-2 m-0 flex">
            <LoadingDots />
          </i>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button
