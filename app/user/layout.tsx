import type { Metadata } from 'next'
import UserLayoutClient from './UserLayoutClient'
import { noIndexMetadata } from '@lib/constants/metadata'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@lib/auth/authOptions'

export const metadata: Metadata = noIndexMetadata

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return <UserLayoutClient>{children}</UserLayoutClient>
}
