import { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string | null
    firstName: string
    lastName: string
    phone?: string | null
  }

  interface Session {
    user: {
      id: string
      role: string | null
      firstName: string
      lastName: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    firstName: string
    lastName: string
  }
}
