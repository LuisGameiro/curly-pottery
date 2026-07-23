import { auth } from '@/auth'

/**
 * Server-side admin access check for server actions and API routes.
 * Returns the session if the user is an admin, or an error response.
 */
export async function assertAdmin() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    return {
      success: false as const,
      message: 'Unauthorized: Administrative privileges required.',
    }
  }

  return session
}

/**
 * Convenience boolean check — true if the authenticated user is an admin.
 * Safe to use inline in guards without needing a full early return.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role?.toUpperCase() === 'ADMIN'
}
