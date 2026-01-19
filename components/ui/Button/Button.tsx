"use client";

import React, {
  forwardRef,
  ButtonHTMLAttributes,
  useRef,
  ElementType,
} from "react";
import { mergeRefs } from "react-merge-refs";
import s from "./Button.module.css";
import { LoadingDots } from "@components/ui";
import { cn } from "@lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  className?: string;
  variant?: "flat" | "slim" | "ghost" | "naked" | "secondary";
  size?: "sm" | "md" | "lg";
  color?: "primary" | "danger" | "success" | "warning";
  active?: boolean;
  type?: "submit" | "reset" | "button";
  Component?: ElementType;
  width?: string | number;
  loading?: boolean;
  disabled?: boolean;
}

const Button = forwardRef((props: ButtonProps, buttonRef) => {
  const {
    className,
    variant = "flat",
    size = "md",
    color = "primary",
    children,
    active,
    width,
    loading = false,
    disabled = false,
    style = {},
    Component = "button",
    ...rest
  } = props;

  const ref = useRef<typeof Component>(null);

  const rootClassName = cn(
    s.root,
    {
      [s.ghost]: variant === "ghost",
      [s.slim]: variant === "slim",
      [s.naked]: variant === "naked",
      [s.secondary]: variant === "secondary",
      // Map sizes
      [s.sm]: size === "sm",
      [s.lg]: size === "lg",
      // Map colors
      [s.danger]: color === "danger",
      [s.success]: color === "success",
      [s.warning]: color === "warning",
      [s.loading]: loading,
      [s.disabled]: disabled,
    },
    className,
  );

  return (
    <Component
      aria-pressed={active}
      data-variant={variant}
      data-size={size}
      data-color={color}
      ref={mergeRefs([ref, buttonRef])}
      className={rootClassName}
      disabled={disabled}
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
    </Component>
  );
});

Button.displayName = "Button";

export default Button;
