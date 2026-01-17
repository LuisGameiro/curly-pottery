"use client";

import { cn } from "@lib/utils";
import s from "./Input.module.css";
import React, { InputHTMLAttributes, useId } from "react";
import { Search } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
  onValueChange?: (value: string) => void;
}

const InputSearch: React.FC<InputProps> = (props) => {
  const { className, label, error, onValueChange, id, ...rest } = props;

  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const rootClassName = cn(
    s.root,
    {
      [s.error]: !!error,
      [s.withIcon]: true,
    },
    className,
  );

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (onValueChange) {
      onValueChange(newValue);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className={s.container}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className={s.inputWrapper}>
        <input
          id={inputId}
          className={rootClassName}
          onChange={handleOnChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          type={"text"}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        <Search size={20} className={s.toggleButton} />
      </div>
      {error && (
        <p id={errorId} className={s.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputSearch;
