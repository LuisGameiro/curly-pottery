import type { Metadata } from 'next'
import UserLayoutClient from './UserLayoutClient'
import { noIndexMetadata } from '@lib/constants/metadata'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = noIndexMetadata

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side gate — logged-out users never see the user shell.
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }
  return <UserLayoutClient>{children}</UserLayoutClient>
}
