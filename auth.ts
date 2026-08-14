import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from 'prisma/prisma'
import GoogleProvider from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { verifyPassword } from '@lib/auth/password'
import { cache } from 'react'

const nextAuth = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        const nameParts = (profile.given_name || profile.name || '').split(' ')
        return {
          id: profile.sub,
          email: profile.email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          role: 'USER',
        }
      },
    }),
    Credentials({
      credentials: {
        email: { label: 'Email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password,
        )
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.name = (user.firstName || '') + ' ' + (user.lastName || '')
        token.email = user.email
        token.roleFetchedAt = Date.now()
      }
      if (trigger === 'update' && session) {
        token.firstName = session.firstName
        token.lastName = session.lastName
        token.roleFetchedAt = 0 // force a role refresh next read
      }
      // Refresh the role from the DB periodically (at most every 5 min) so
      // role changes (e.g. demoting an admin) take effect without waiting for
      // the ~30 day JWT expiry.
      const roleFetchedAt = (token.roleFetchedAt as number) || 0
      if (token.sub && Date.now() - roleFetchedAt > 5 * 60 * 1000) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.roleFetchedAt = Date.now()
          }
        } catch {
          // Swallow DB errors — keep the last known role.
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.firstName = (token.firstName as string) || ''
        session.user.lastName = (token.lastName as string) || ''
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
})

// Wrap in React.cache() so calling auth() multiple times in one request
// (page + server action) reuses the decoded session instead of re-reading
// cookies/headers and re-decoding the JWT each time.
export const { handlers, signIn, signOut } = nextAuth
export const auth = cache(nextAuth.auth)
