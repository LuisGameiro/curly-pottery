import { cn } from "@lib/utils";
import s from "./Input.module.css";
import React, { InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
  onValueChange?: (value: string) => void;
}

const Input: React.FC<InputProps> = (props) => {
  const { className, label, error, onValueChange, id, ...rest } = props;

  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const rootClassName = cn(
    s.root,
    {
      [s.error]: !!error,
    },
    className,
  );

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className={s.container}>
      {label && <label htmlFor={inputId}>{label}</label>}

      <input
        id={inputId}
        className={rootClassName}
        onChange={handleOnChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        // ARIA Rules
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />

      {error && (
        <p id={errorId} className={s.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
