import type { Metadata } from 'next'
import AdminLayoutClient from './AdminLayoutClient'
import { noIndexMetadata } from '@lib/constants/metadata'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isAdminRole } from '@lib/auth/admin'

export const metadata: Metadata = noIndexMetadata

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side gate so the admin shell never ships to non-admins.
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }
  if (!isAdminRole(session.user.role)) {
    redirect('/forbidden')
  }
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
