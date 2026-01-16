import { cn } from "@lib/utils";
import s from "./Input.module.css";
import React, { InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
}

const InputCheck: React.FC<InputProps> = (props) => {
  const { className, label, error, id, ...rest } = props;

  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className={cn(s.container)}>
      <div className="flex flex-row mr-4 w-full items-center">
        <input
          id={inputId}
          className="h-5 w-5 rounded border-border text-primary focus:ring-primary mr-2"
          onChange={handleOnChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          type="checkbox"
          // ARIA Rules
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {label && (
          <label
            htmlFor={inputId}
            className="text-text-base p-0 m-0 font-medium"
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p id={errorId} className={s.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputCheck;
