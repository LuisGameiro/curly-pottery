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
  role?: string;
}

type Variant =
  | "heading"
  | "body"
  | "pageHeading"
  | "sectionHeading"
  | "subHeading"
  | "bold"
  | "boxTitle"
  | "error";

const Text = ({
  style,
  className = "",
  variant = "body",
  children,
  html,
  onClick,
  role,
}: TextProps) => {
  const componentsMap: Record<Variant, ElementType> = {
    body: "div",
    heading: "h1",
    pageHeading: "h1",
    sectionHeading: "h2",
    boxTitle: "h3",
    subHeading: "h5",
    bold: "strong",
    error: "p",
  };

  const Component = componentsMap[variant];

  const htmlContentProps = html
    ? {
        dangerouslySetInnerHTML: { __html: html },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      style={style}
      role={role}
      {...htmlContentProps}
      className={cn(s.root, s[variant], className)}
    >
      {children}
    </Component>
  );
};

export default Text;
