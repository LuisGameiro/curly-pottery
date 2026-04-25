import type { Metadata } from 'next'
import UserLayoutClient from './UserLayoutClient'
import { noIndexMetadata } from '@lib/constants/metadata'

export const metadata: Metadata = noIndexMetadata

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <UserLayoutClient>{children}</UserLayoutClient>
}
