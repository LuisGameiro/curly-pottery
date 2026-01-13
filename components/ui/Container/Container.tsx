import { cn } from "@lib/utils";
import React, { FC } from "react";

interface ContainerProps {
  className?: string;
  children?: any;
  el?: HTMLElement;
  clean?: boolean;
  variant?: 'default' | 'box'
}

const Container: FC<ContainerProps> = ({
  children,
  className,
  el = "div",
  variant = 'default',
  clean = false,
}) => {
  const rootClassName = cn( {
    "mx-auto max-w-7xl px-6 w-full my-4 flex-col justify-center": !clean && variant === 'default',
    "bg-accent-1 border rounded-xl p-6 shadow-sm": !clean && variant === 'box',
    
  }, className);

  let Component: React.ComponentType<React.HTMLAttributes<HTMLDivElement>> =
    el as any;

  return <Component className={rootClassName}>{children}</Component>;
};

export default Container;
