"use client";

import { cn } from "@lib/utils";
import s from "./Marquee.module.css";
import {
  FC,
  ReactNode,
  Children,
  cloneElement,
  ReactElement,
  isValidElement,
} from "react";
import { default as FastMarquee } from "react-fast-marquee";

interface MarqueeProps {
  className?: string;
  children?: ReactNode;
  variant?: "primary" | "secondary";
}

const Marquee = (
  {
    children = [],
    className = "",
    variant = "primary"
  }: MarqueeProps
) => {
  const rootClassName = cn(
    s.root,
    {
      [s.primary]: variant === "primary",
      [s.secondary]: variant === "secondary",
    },
    className,
  );

  return (
    <FastMarquee gradient={false} className={rootClassName} autoFill={true}>
      {/* {Children.map(children, (child: any) => ({
        ...child,
        props: {
          ...child.props,
          className: cn(child.props.className, `${variant}`),
        },
      }))} */}
      {Children.map(children, (child: ReactNode) => {
        if (!isValidElement(child)) return child;

        const element = child as ReactElement<{ className?: string }>;

        return cloneElement(element, {
          className: cn(element.props.className, variant),
        });
      })}
    </FastMarquee>
  );
};

export default Marquee;
