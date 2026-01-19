import { CSSProperties, ElementType } from "react";
import s from "./Text.module.css";
import { cn } from "@lib/utils";

interface TextProps {
  variant?: Variant;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  html?: string;
  onClick?: () => void;
}

type Variant =
  | "heading"
  | "body"
  | "pageHeading"
  | "sectionHeading"
  | "subHeading"
  | "bold"
  | "boxTitle";

const Text = (
  {
    style,
    className = "",
    variant = "body",
    children,
    html,
    onClick
  }: TextProps
) => {
  const componentsMap: Record<Variant, ElementType> = {
    body: "div",
    heading: "h1",
    pageHeading: "h1",
    sectionHeading: "h2",
    boxTitle: "h3",
    subHeading: "h5",
    bold: "strong",
  };

  const Component = componentsMap[variant];

  const htmlContentProps = html
    ? {
        dangerouslySetInnerHTML: { __html: html },
      }
    : {};

  return (
    <Component
      className={cn(s.root, s[variant], className)}
      onClick={onClick}
      style={style}
      {...htmlContentProps}
    >
      {children}
    </Component>
  );
};

export default Text;
