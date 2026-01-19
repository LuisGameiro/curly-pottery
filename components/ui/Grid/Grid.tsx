"use client";

import { FC, ReactNode } from "react";
import s from "./Grid.module.css";
import { cn } from "@lib/utils";

interface GridProps {
  className?: string;
  children?: ReactNode;
  layout?: "A" | "B" | "C" | "D" | "normal";
  variant?: "default" | "filled";
}

const Grid = (
  {
    className,
    layout = "A",
    children,
    variant = "default"
  }: GridProps
) => {
  const rootClassName = cn(
    s.root,
    {
      [s.layoutA]: layout === "A",
      // [s.layoutB]: layout === "B",
      // [s.layoutC]: layout === "C",
      // [s.layoutD]: layout === "D",
      // [s.layoutNormal]: layout === "normal",
      // [s.default]: variant === "default",
      [s.filled]: variant === "filled",
    },
    className,
  );
  return <div className={rootClassName}>{children}</div>;
};

export default Grid;
