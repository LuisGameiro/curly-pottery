import { cn } from "@lib/utils";
import s from "./Input.module.css";
import React, {
  TextareaHTMLAttributes,
  useId,
} from "react";

interface InputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  label?: string;
  error?: string;
  onValueChange?: (value: string) => void;
}

const InputTextArea: React.FC<InputProps> = (props) => {
  const { className, label, error, onValueChange, id, ...rest } = props;

  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const rootClassName = cn(
    s.rootArea,
    {
      [s.error]: !!error,
    },
    className,
  );

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

      <textarea
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

export default InputTextArea;
