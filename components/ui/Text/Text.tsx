import { CSSProperties, ElementType } from 'react'
import s from './Text.module.css'
import { cn } from '@lib/utils'
import purify from 'dompurify'

interface TextProps {
  variant?: Variant
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
  html?: string
  onClick?: () => void
  role?: string
  /** Test identifier forwarded to the root element */
  'data-testid'?: string
}

type Variant =
  | 'heading'
  | 'body'
  | 'pageHeading'
  | 'sectionHeading'
  | 'subHeading'
  | 'bold'
  | 'boxTitle'
  | 'error'
  | 'muted'
  | 'span'

const Text = ({
  style,
  className = '',
  variant = 'body',
  children,
  html,
  onClick,
  role,
  'data-testid': testId,
}: TextProps) => {
  const componentsMap: Record<Variant, ElementType> = {
    body: 'div',
    heading: 'h1',
    pageHeading: 'h1',
    sectionHeading: 'h2',
    boxTitle: 'h3',
    subHeading: 'h5',
    bold: 'strong',
    error: 'p',
    muted: 'p',
    span: 'span',
  }

  const Component = componentsMap[variant]

  const htmlContentProps = html
    ? {
        dangerouslySetInnerHTML: { __html: purify.sanitize(html) },
      }
    : {}

  return (
    <Component
      onClick={onClick}
      style={style}
      role={role}
      data-testid={testId}
      {...htmlContentProps}
      className={cn(s.root, s[variant], className)}
    >
      {children}
    </Component>
  )
}

export default Text
