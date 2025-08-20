import NextAuth, { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import type { User } from '@/types'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Mock user data
const MOCK_USER: User = {
  id: '1',
  email: 'admin@books.com',
  name: 'Admin User',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
}

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/en/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAuth = nextUrl.pathname.includes('/login')
      
      if (isOnAuth) {
        if (isLoggedIn) {
          // Extract locale from the current path
          const locale = nextUrl.pathname.split('/')[1] || 'en'
          return Response.redirect(new URL(`/${locale}/books`, nextUrl))
        }
        return true
      }
      
      if (!isLoggedIn) {
        // Extract locale from the current path or default to 'en'
        const locale = nextUrl.pathname.split('/')[1] || 'en'
        return Response.redirect(new URL(`/${locale}/login`, nextUrl))
      }
      
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    session({ session, token }) {
      if (token.user) {
        session.user = {
          ...token.user,
          emailVerified: null
        } as User & { emailVerified: Date | null }
      }
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials)
        
        if (!parsedCredentials.success) {
          return null
        }
        
        const { email, password } = parsedCredentials.data
        
        // Mock authentication - only accept admin@books.com / admin123
        if (email === 'admin@books.com' && password === 'admin123') {
          return MOCK_USER
        }
        
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
}

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)