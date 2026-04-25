import type { Metadata } from 'next'
import AdminLayoutClient from './AdminLayoutClient'
import { noIndexMetadata } from '@lib/constants/metadata'

export const metadata: Metadata = noIndexMetadata

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
