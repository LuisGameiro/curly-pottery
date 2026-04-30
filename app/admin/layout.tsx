import type { Metadata } from 'next'
import AdminLayoutClient from './AdminLayoutClient'
import { noIndexMetadata } from '@lib/constants/metadata'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@lib/auth/authOptions'

export const metadata: Metadata = noIndexMetadata

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
