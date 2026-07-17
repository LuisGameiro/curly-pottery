'use client'

import { cn } from '@lib/utils'
import s from './Input.module.css'
import React, { SelectHTMLAttributes, useId } from 'react'

interface InputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
  label?: string
  error?: string
  options: string[]

  onValueChange?: (value: string) => void
}

const Input = (props: InputProps) => {
  const { className, label, error, onValueChange, id, options, ...rest } = props

  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`

  const rootClassName = cn(
    s.root,
    {
      [s.error]: !!error,
    },
    className,
  )

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value)
    }
    if (props.onChange) {
      props.onChange(e)
    }
  }

  return (
    <div className={s.container}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <select
        id={inputId}
        className={rootClassName}
        onChange={handleOnChange}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      >
        {options.map((o) => (
          <option className={s.options} key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className={s.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
