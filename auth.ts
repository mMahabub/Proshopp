import NextAuth, { type DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from '@/db/prisma'
import { compareSync } from 'bcrypt-ts-edge'
import { z } from 'zod'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      email: string
      name: string
      image?: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

// Validation schema for credentials sign-in
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },

  providers: [
    // Credentials Provider (Email & Password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate credentials
        const parsedCredentials = signInSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          throw new Error('Invalid credentials')
        }

        const { email, password } = parsedCredentials.data

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        // Verify password
        const isPasswordValid = compareSync(password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    // JWT Callback - runs whenever a JWT is created or updated
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user && user.id) {
        token.id = user.id
        token.role = user.role || 'user'
      }

      // Update session trigger (when session is updated)
      if (trigger === 'update' && session) {
        token.name = session.name
        token.email = session.email
      }

      return token
    },

    // Session Callback - runs whenever session is checked
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.email = token.email ?? session.user.email
        session.user.name = token.name ?? session.user.name
        session.user.image = token.picture ?? session.user.image
      }

      return session
    },

    // Sign-in Callback - runs on sign-in attempt
    async signIn({ user, account }) {
      // For OAuth providers, create user if doesn't exist
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!user.email) {
          return false
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        // If user doesn't exist, they will be created by the adapter
        // If user exists, they will be linked to the OAuth account
        return true
      }

      // For credentials provider, user must exist and be verified
      // (We'll add email verification in future tasks)
      return true
    },
  },

  events: {
    // Event: User created via OAuth
    async createUser({ user }) {
      console.log('New user created:', user.email)
    },

    // Event: User signs in
    async signIn({ user, account }) {
      console.log('User signed in:', user.email, 'via', account?.provider)
    },
  },

  debug: process.env.NODE_ENV === 'development',
})
