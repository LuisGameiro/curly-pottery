'use client'

import { useSession } from 'next-auth/react'

export function useUser() {
  const { data: session, status } = useSession()

  const user = session?.user
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const isAdmin = user?.role === 'ADMIN'

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
  }
}
