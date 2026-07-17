'use client'

import { cn } from '@lib/utils'
import s from './Input.module.css'
import React, { InputHTMLAttributes, useId, useState } from 'react'
import { EyeOff, Eye } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  label?: string
  error?: string
  onValueChange?: (value: string) => void
}

const Input = (props: InputProps) => {
  const { className, label, error, onValueChange, id, type, ...rest } = props

  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`

  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const rootClassName = cn(
    s.root,
    {
      [s.error]: !!error,
      [s.withIcon]: isPassword,
    },
    className,
  )

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    if (onValueChange) {
      onValueChange(newValue)
    }
    if (props.onChange) {
      props.onChange(e)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <div className={s.container}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className={s.inputWrapper}>
        <input
          id={inputId}
          className={rootClassName}
          onChange={handleOnChange}
          autoComplete={rest.autoComplete || 'off'}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={s.toggleButton}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className={s.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
