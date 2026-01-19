import { cn } from "@lib/utils";
import { ElementType, HTMLAttributes, ReactNode } from "react";

interface ContainerProps {
  className?: string;
  children?: ReactNode;
  el?: React.ElementType;
  clean?: boolean;
  variant?: "default" | "box";
}

const Container = ({
  children,
  className,
  el = "div",
  variant = "default",
  clean = false,
}: ContainerProps) => {
  const rootClassName = cn(
    {
      "mx-auto px-6 w-full flex-col justify-center":
        !clean && variant === "default",
      "bg-accent-1 border rounded-xl p-6 shadow-sm":
        !clean && variant === "box",
    },
    className,
  );
  const Component = el as ElementType<HTMLAttributes<HTMLElement>>;

  return <Component className={rootClassName}>{children}</Component>;
};

export default Container;
