import NextAuth, { type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from '@/db/prisma'
import { compareSync } from 'bcrypt-ts-edge'
import { z } from 'zod'

// Validate required environment variables
if (!process.env.AUTH_SECRET) {
  throw new Error(
    'AUTH_SECRET is not defined in environment variables. ' +
    'This is required for NextAuth to work properly. ' +
    'Generate one with: npx auth secret'
  )
}

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
  // Note: adapter removed - not needed with JWT strategy
  // PrismaAdapter only required for database session strategy

  // Trust host header for serverless deployments (Netlify, Vercel, etc.)
  trustHost: true,

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
        try {
          // Validate credentials
          const parsedCredentials = signInSchema.safeParse(credentials)

          if (!parsedCredentials.success) {
            console.error('[AUTH] Invalid credentials format:', parsedCredentials.error)
            throw new Error('Invalid credentials')
          }

          const { email, password } = parsedCredentials.data
          console.log('[AUTH] Attempting to authenticate user:', email)

          // Find user by email with error handling
          let user
          try {
            user = await prisma.user.findUnique({
              where: { email },
            })
          } catch (dbError) {
            console.error('[AUTH] Database error during user lookup:', dbError)
            throw new Error('Database connection failed. Please try again later.')
          }

          if (!user || !user.password) {
            console.log('[AUTH] User not found or no password set:', email)
            throw new Error('Invalid email or password')
          }

          // Check if email is verified
          if (!user.emailVerified) {
            console.log('[AUTH] Email not verified:', email)
            throw new Error(
              'Please verify your email address before signing in. Check your inbox for the verification link.'
            )
          }

          // Verify password
          const isPasswordValid = compareSync(password, user.password)

          if (!isPasswordValid) {
            console.log('[AUTH] Invalid password for user:', email)
            throw new Error('Invalid email or password')
          }

          console.log('[AUTH] Authentication successful for user:', email)
          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          // Log the full error for debugging
          console.error('[AUTH] Authorization error:', error)
          // Re-throw with user-friendly message
          throw error
        }
      },
    }),

    // Google OAuth Provider (conditionally added if credentials are set)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    // GitHub OAuth Provider (conditionally added if credentials are set)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
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
      try {
        // For OAuth providers, ensure email is verified
        if (account?.provider === 'google' || account?.provider === 'github') {
          if (!user.email) {
            console.error('[AUTH] OAuth sign-in: No email provided')
            return false
          }

          // Check if user exists with error handling
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
            })

            // If user exists but emailVerified is null, set it to current time
            // (OAuth providers have already verified the email)
            if (existingUser && !existingUser.emailVerified) {
              await prisma.user.update({
                where: { email: user.email },
                data: { emailVerified: new Date() },
              })
              console.log('[AUTH] OAuth sign-in: Email verified for user:', user.email)
            }
          } catch (dbError) {
            console.error('[AUTH] OAuth sign-in: Database error:', dbError)
            // Allow sign-in to continue even if verification update fails
          }

          return true
        }

        // For credentials provider, user must exist and be verified
        return true
      } catch (error) {
        console.error('[AUTH] Sign-in callback error:', error)
        // Allow sign-in to continue even if there's an error
        return true
      }
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
