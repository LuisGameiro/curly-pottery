import type { Metadata } from 'next'
import { noIndexMetadata } from '@lib/constants/metadata'

export const metadata: Metadata = noIndexMetadata

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
