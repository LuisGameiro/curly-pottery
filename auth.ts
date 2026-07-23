import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from 'prisma/prisma'
import GoogleProvider from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { verifyPassword } from '@lib/auth/password'

export const { handlers, auth, signIn, signOut } = NextAuth({
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
      }
      if (trigger === 'update' && session) {
        token.firstName = session.firstName
        token.lastName = session.lastName
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
