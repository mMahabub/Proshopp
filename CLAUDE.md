# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Proshopp** is a modern e-commerce application built with Next.js 15, React 19, Prisma ORM, and PostgreSQL (Neon serverless). The application uses TypeScript, Tailwind CSS with shadcn/ui components, and implements server actions for data fetching.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build production application
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npm run postinstall         # Generate Prisma Client (runs automatically after npm install)
npx prisma generate         # Manually generate Prisma Client
npx prisma db push          # Push schema changes to database
npx prisma migrate dev      # Create and apply migrations
npx prisma studio           # Open Prisma Studio GUI
npx tsx db/seed.ts          # Seed database with sample data
npx prisma migrate status   # Check migration status
npx prisma validate         # Validate Prisma schema
```

### 🔴 Database Migration Verification (MANDATORY)

**After running ANY database migration, you MUST verify the changes in the actual database:**

1. **Run the migration:**
   ```bash
   npx prisma migrate dev --name descriptive_migration_name
   ```

2. **Verify migration status:**
   ```bash
   npx prisma migrate status
   # Should show: "Database schema is up to date!"
   ```

3. **Validate schema:**
   ```bash
   npx prisma validate
   # Should show: "The schema at prisma/schema.prisma is valid"
   ```

4. **Connect to database and verify changes:**
   ```bash
   npx prisma studio
   # OR use the database connection string to connect directly
   ```

5. **Manual database inspection:**
   - Open Prisma Studio (`npx prisma studio`)
   - Verify new tables/columns exist
   - Check data types match schema
   - Verify indexes and constraints are created
   - Test relationships if applicable

6. **Alternative: Direct SQL verification:**
   ```bash
   # Connect using the DATABASE_URL from .env
   # For Neon: Use their web console or psql client
   # Verify schema changes with SQL queries:
   \dt                           # List all tables
   \d table_name                 # Describe specific table
   SELECT * FROM table_name;     # Test query
   ```

**⚠️ CRITICAL: Do not mark migration task as complete until:**
- ✅ Migration files committed to git
- ✅ `npx prisma migrate status` shows clean state
- ✅ `npx prisma validate` passes
- ✅ Prisma Studio shows new schema changes
- ✅ Manual verification in database confirms changes
- ✅ All automated checks pass (TypeScript, lint, tests, build)

**Common Migration Issues:**
- Migration applied but schema not updated → Run `npx prisma generate`
- Database out of sync → Check `npx prisma migrate status`
- Migration conflicts → Resolve manually or reset dev database
- Changes not visible → Clear Prisma Studio cache, refresh connection

## Architecture

### Routing Structure (App Router)
- **`app/layout.tsx`** - Root layout with theme provider (light/dark mode via next-themes)
- **`app/(root)/layout.tsx`** - Main layout with Header and Footer for public pages
- **`app/(root)/page.tsx`** - Homepage
- **`app/(root)/product/[slug]/page.tsx`** - Dynamic product detail page

### Key Directories
- **`lib/`** - Shared utilities, constants, validators, and server actions
  - `lib/constants/index.ts` - App-wide constants (APP_NAME, SERVER_URL, etc.)
  - `lib/actions/product.actions.ts` - Server actions for product operations
  - `lib/utils.ts` - Utility functions (cn, convertToPlainObject, formatNumberWithDecimal)
  - `lib/validators.ts` - Zod schemas for validation (insertProductSchema with currency validation)

- **`components/`** - React components
  - `components/ui/` - shadcn/ui components (button, card, badge, dropdown-menu, sheet, etc.)
  - `components/shared/` - Shared components (Header, Footer, Product components)
  - `components/shared/product/` - Product-specific components (ProductCard, ProductList, ProductPrice, ProductImages)
  - `components/shared/header/` - Header components (Menu, ModeToggle)

- **`db/`** - Database configuration and seeding
  - `db/prisma.ts` - Prisma client with Neon adapter and custom result transformers
  - `db/seed.ts` - Database seeding script
  - `db/sample-data.ts` - Sample data for seeding

- **`types/`** - TypeScript type definitions
  - `types/index.ts` - Product type derived from Zod schema

- **`prisma/`** - Database schema and migrations
  - `prisma/schema.prisma` - Database schema with Product, User, Account, Session models

- **`assets/`** - Static assets including global styles

## Database Architecture

### Prisma Setup (Neon Serverless)
- Uses Neon serverless PostgreSQL with WebSocket connections
- Custom Prisma adapter (`PrismaNeon`) for serverless compatibility
- Result transformers convert Decimal fields (price, rating) to strings automatically

### Models
- **Product** - UUID primary key, slug-based routing, supports multiple images, featured products with banners
- **User** - UUID primary key, supports OAuth accounts, includes address JSON field and role-based access
- **Account** - OAuth provider accounts (composite key: provider + providerAccountId)
- **Session** - User sessions with expiration
- **VerificationToken** - Email verification tokens

### Important Notes
- Prisma Client includes custom result transformers in `db/prisma.ts` that convert `price` and `rating` Decimal fields to strings
- When seeding, use the base PrismaClient (not the extended one from `db/prisma.ts`)
- UUID generation uses `gen_random_uuid()` database function

## Server Actions Pattern
- All data fetching uses Next.js server actions (marked with `'use server'`)
- Located in `lib/actions/` directory
- Example: `getLatestProducts()`, `getProductBySlug(slug)`
- Always use `convertToPlainObject()` when returning Prisma data to serialize it properly

## Validation
- Zod schemas in `lib/validators.ts`
- Currency validation enforces exactly 2 decimal places
- Product schema includes image array validation (minimum 1 image required)
- Types derived from Zod schemas using `z.infer<>`

## Styling
- Tailwind CSS with custom configuration
- Inter font family (Google Fonts)
- Dark mode support via `next-themes` with system detection
- shadcn/ui components with class-variance-authority
- `cn()` utility for className merging

## Image Handling
- Remote images configured for `utfs.io` domain in `next.config.ts`
- Products support multiple images as string arrays

## Environment Variables
Required environment variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXT_PUBLIC_APP_NAME` - App name (default: "Proshopp")
- `NEXT_PUBLIC_APP_DESCRIPTION` - App description
- `NEXT_PUBLIC_SERVER_URL` - Server URL (default: http://localhost:3000)
- `LATEST_PRODUCTS_LIMIT` - Number of latest products to fetch (default: 4)

## Path Aliases
- `@/*` resolves to project root (configured in tsconfig.json)
- Example: `@/lib/utils`, `@/components/ui/button`

## Project Status & Documentation

### Current Completion: 24%
The project is in early development stage. Core documentation exists to guide development:
- **spec.md** - Feature specifications and requirements
- **plan.md** - Architecture decisions and implementation strategy
- **task.md** - Detailed task breakdown (54 tasks across 9 phases)

**Completed Tasks:**
- ✅ TASK-001 to TASK-005: Bug fixes and core improvements
- ✅ TASK-102: Auth.js configuration with Prisma adapter
- ✅ TASK-103: Authentication middleware
- ✅ TASK-104: Sign-up page and form with password strength indicator
- ✅ TASK-105: Sign-in page and form with OAuth integration
- ✅ TASK-106: Email verification system with Resend
- ✅ TASK-107: Password reset flow with email tokens
- ✅ TASK-108: Header auth state with user dropdown

### 🔴 TEST-FIRST DEVELOPMENT (MANDATORY)
**All code must have tests. No exceptions.**
- Tests written BEFORE implementation (TDD)
- Coverage thresholds enforced (70% minimum)
- Tasks cannot be completed without passing tests
- See TASK-000 for test infrastructure setup

### Known Bugs (See task.md Phase 0)
1. `formatNumberWithDecimal()` in utils.ts uses comma instead of dot (line 19)
2. ProductCard shows rating with dollar sign (product-card.tsx line 36)
3. Not-found page has grammar error (line 16)
4. mode-toggle.tsx imports from Radix directly instead of UI component (line 4)
5. Uncommitted migration: `20250421030636_add_user_based_t/`

### Upcoming Architecture Additions

#### Authentication (Auth.js v5) - ✅ IMPLEMENTED
- **Installation**: `npm install next-auth@beta @auth/prisma-adapter bcrypt-ts-edge` ✅
- **Config File**: `auth.ts` (root) ✅
- **Providers**: Credentials, Google, GitHub ✅
- **Session Strategy**: JWT with 30-day expiry ✅
- **Middleware**: `middleware.ts` for route protection ✅
- **Routes**:
  - Public: `/sign-in` ✅, `/sign-up` ✅, `/verify-email` ✅, `/reset-password` (pending)
  - Protected: `/dashboard/*` ✅, `/checkout/*` ✅
  - Admin: `/admin/*` ✅

**Implementation Details (TASK-102, TASK-103, TASK-104, TASK-105, TASK-106):**

**Auth Configuration (`auth.ts`):**
```typescript
import NextAuth, { type DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from '@/db/prisma'
import { compareSync } from 'bcrypt-ts-edge'
import { z } from 'zod'

// Extended session types
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
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Validate credentials, check email verification, verify password
        if (!user.emailVerified) {
          throw new Error('Please verify your email address before signing in.')
        }
        const isPasswordValid = compareSync(password, user.password)
        // Return user object
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user.id and user.role to token
    },
    async session({ session, token }) {
      // Add token.id and token.role to session
    },
    async signIn({ user, account }) {
      // OAuth users auto-verify email
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (existingUser && !existingUser.emailVerified) {
          await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: new Date() },
          })
        }
      }
      return true
    },
  },
})
```

**Auth API Routes (`app/api/auth/[...nextauth]/route.ts`):**
```typescript
import { handlers } from '@/auth'

export const { GET, POST } = handlers
```

**Authentication Middleware (`middleware.ts`):**
```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth } = req
  const isLoggedIn = !!auth?.user
  const userRole = auth?.user?.role

  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isCheckoutRoute = nextUrl.pathname.startsWith('/checkout')

  // Dashboard/Checkout: Require authentication
  if ((isDashboardRoute || isCheckoutRoute) && !isLoggedIn) {
    const signInUrl = new URL('/sign-in', nextUrl)
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Admin: Require authentication AND admin role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const signInUrl = new URL('/sign-in', nextUrl)
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)',
  ],
}
```

**Auth Validation Schemas (`lib/validations/auth.ts`):**
```typescript
import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
```

**Server Actions (`lib/actions/auth.actions.ts`):**
```typescript
'use server'

import { signIn, signOut } from '@/auth'
import { prisma } from '@/db/prisma'
import { hashSync } from 'bcrypt-ts-edge'

// Sign up with email verification
export async function signUp(prevState: unknown, formData: FormData) {
  const validatedData = signUpSchema.parse(data)

  // Create user with emailVerified: null
  await prisma.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      password: hashSync(validatedData.password, 10),
      role: 'user',
      emailVerified: null, // Requires verification
    },
  })

  // Send verification email
  const token = await createVerificationToken(validatedData.email)
  await sendVerificationEmail(validatedData.email, validatedData.name, token)

  return { success: true, message: 'Check your email to verify account' }
}

// Sign in with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
  const validatedData = signInSchema.parse(data)

  await signIn('credentials', {
    email: validatedData.email,
    password: validatedData.password,
    redirect: true,
    redirectTo: '/dashboard',
  })
}

// Sign in with OAuth
export async function signInWithOAuth(provider: 'google' | 'github') {
  await signIn(provider, { redirectTo: '/dashboard' })
}

// Sign out
export async function signOutUser() {
  await signOut({ redirectTo: '/' })
}
```

**Sign-Up Form with Password Strength Indicator (`components/auth/sign-up-form.tsx`):**
```typescript
'use client'

import { useActionState, useEffect, useState } from 'react'
import { signUp, signInWithOAuth } from '@/lib/actions/auth.actions'

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, undefined)
  const [password, setPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '',
  })

  // Password strength checker (5-point scale)
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: '' })
      return
    }

    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    if (checks.length) score++
    if (checks.uppercase) score++
    if (checks.lowercase) score++
    if (checks.number) score++
    if (checks.special) score++

    let message = ''
    let color = ''

    if (score <= 2) {
      message = 'Weak'
      color = 'bg-red-500'
    } else if (score === 3) {
      message = 'Fair'
      color = 'bg-yellow-500'
    } else if (score === 4) {
      message = 'Good'
      color = 'bg-blue-500'
    } else {
      message = 'Strong'
      color = 'bg-green-500'
    }

    setPasswordStrength({ score, message, color })
  }, [password])

  return (
    <form action={formAction}>
      {/* Password field */}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Password strength indicator */}
      {password && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${passwordStrength.color} transition-all`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">{passwordStrength.message}</span>
          </div>
        </div>
      )}

      {/* OAuth buttons using .bind() */}
      <form action={signInWithOAuth.bind(null, 'google')}>
        <Button type="submit">Sign up with Google</Button>
      </form>
    </form>
  )
}
```

**Sign-In Form (`components/auth/sign-in-form.tsx`):**
```typescript
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { signInWithCredentials, signInWithOAuth } from '@/lib/actions/auth.actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  )
}

export default function SignInForm() {
  const [state, formAction] = useActionState(signInWithCredentials, undefined)

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {state?.success === false && (
        <div className="rounded-md bg-destructive/10 p-3">
          {state.message}
        </div>
      )}

      {/* Sign-in Form */}
      <form action={formAction}>
        {/* Email and Password fields */}

        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2">
          <input id="remember" name="remember" type="checkbox" />
          <label htmlFor="remember">Remember me for 30 days</label>
        </div>

        <SubmitButton />
      </form>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <form action={signInWithOAuth.bind(null, 'google')}>
          <Button type="submit" variant="outline">Google</Button>
        </form>
        <form action={signInWithOAuth.bind(null, 'github')}>
          <Button type="submit" variant="outline">GitHub</Button>
        </form>
      </div>
    </div>
  )
}
```

**Security Features:**
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Email verification required before sign-in
- ✅ OAuth providers auto-verify email (trusted providers)
- ✅ JWT session strategy (30-day expiry)
- ✅ Account linking enabled for OAuth providers
- ✅ Role-based access control (admin vs user)
- ✅ Protected routes via middleware
- ✅ Callback URL preservation for post-login redirects

**Environment Variables:**
```env
NEXTAUTH_SECRET=generate-with-npx-auth-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**Testing Authentication:**
```typescript
// Test sign-up form
describe('SignUpForm', () => {
  it('should render password strength indicator', () => {
    // Test password strength calculation
  })

  it('should show error for weak passwords', () => {
    // Test validation
  })
})

// Test sign-in form
describe('SignInForm', () => {
  it('should render remember me checkbox', () => {
    // Test checkbox rendering
  })

  it('should handle OAuth sign-in', () => {
    // Test OAuth flow
  })
})
```

#### State Management (Zustand)
- **Installation**: `npm install zustand`
- **Stores**:
  - `lib/store/cart-store.ts` - Cart state with localStorage persistence
  - Actions: addItem, removeItem, updateQuantity, clearCart
  - Getters: getTotal, getItemCount
- **Pattern**: Client-side state for cart, server state via Server Components

#### Payment Integration (Stripe)
- **Installation**: `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`
- **Server**: `lib/utils/stripe.ts` - Stripe instance
- **Server Actions**: `lib/actions/payment.actions.ts` - createPaymentIntent
- **Client**: Stripe Elements for payment form
- **Webhook**: `app/api/webhooks/stripe/route.ts` - Handle payment events
- **Flow**: Cart → Address → Payment → Confirmation

#### File Upload (UploadThing)
- **Installation**: `npm install uploadthing @uploadthing/react`
- **Config**: `lib/uploadthing.ts` - File router (max 5 images, 4MB each)
- **Route**: `app/api/uploadthing/route.ts`
- **Usage**: Product images in admin panel

#### Email (Resend) - ✅ IMPLEMENTED
- **Installation**: `npm install resend react-email @react-email/components` ✅
- **Service**: Resend (https://resend.com) for transactional emails
- **Templates**: HTML email templates with inline styles
- **Use Cases**: Email verification, password reset, order confirmation

**Implementation Details (TASK-106):**

**Email Utilities (`lib/utils/email.ts`):**
```typescript
import { Resend } from 'resend'
import { prisma } from '@/db/prisma'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate secure verification token (32 bytes, base64url encoded)
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

// Create token with 24-hour expiry
export async function createVerificationToken(email: string): Promise<string> {
  // Delete existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  const token = generateVerificationToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  return token
}

// Verify token (one-time use, deleted after verification)
export async function verifyToken(email: string, token: string): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  })

  if (!verificationToken) return false

  // Check expiration
  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    })
    return false
  }

  // Delete token (one-time use)
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  })

  return true
}

// Send verification email with HTML template
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL
  const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  await resend.emails.send({
    from: `${APP_NAME} <onboarding@resend.dev>`,
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html: `<!-- Beautiful HTML email template -->`,
  })
}
```

**Email Verification Flow:**
1. **Sign-up** → User creates account with `emailVerified: null`
2. **Token Generation** → Creates secure 32-byte token, expires in 24 hours
3. **Email Sent** → Sends HTML email with verification link via Resend
4. **User Clicks Link** → Navigates to `/verify-email?token=xxx&email=xxx`
5. **Token Validation** → Verifies token, checks expiration, deletes token (one-time use)
6. **Update Database** → Sets `user.emailVerified = new Date()`
7. **Redirect** → Auto-redirects to sign-in page after 3 seconds

**Verify Email Page (`app/(auth)/verify-email/page.tsx`):**
- Three states: Loading, Success, Error
- Success: Shows checkmark, message, auto-redirect to sign-in
- Error: Shows X icon, error message, resend email button
- Visual feedback with colored icons (green/red)
- Responsive design with Tailwind CSS

**Security Features:**
- ✅ Cryptographically secure tokens (32 bytes)
- ✅ One-time use tokens (deleted after verification)
- ✅ 24-hour token expiration
- ✅ Email verification required before sign-in
- ✅ OAuth users auto-verified (trusted providers)
- ✅ Resend verification email functionality

**Server Actions:**
```typescript
// Verify email with token
export async function verifyEmail(email: string, token: string) {
  const isValid = await verifyToken(email, token)
  if (!isValid) {
    return { success: false, message: 'Invalid or expired verification link' }
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })

  return { success: true, message: 'Email verified successfully!' }
}

// Resend verification email
export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('User not found')
  if (user.emailVerified) throw new Error('Email already verified')

  const token = await createVerificationToken(email)
  await sendVerificationEmail(email, user.name, token)

  return { success: true, message: 'Verification email sent!' }
}
```

**Email Template Best Practices:**
- Use inline CSS (many email clients don't support external stylesheets)
- Gradient headers for visual appeal
- Clear call-to-action buttons
- Fallback text links for accessibility
- Mobile-responsive design
- Include expiration notice (24 hours)
- Provide alternative action (resend email)

**Environment Variables:**
```env
RESEND_API_KEY=re_...  # Get from https://resend.com/api-keys
```

**Testing Email Verification:**
```typescript
// Test token generation
describe('generateVerificationToken', () => {
  it('should generate unique tokens', () => {
    const token1 = generateVerificationToken()
    const token2 = generateVerificationToken()
    expect(token1).not.toBe(token2)
  })

  it('should generate URL-safe tokens', () => {
    const token = generateVerificationToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})

// Test token verification
describe('verifyToken', () => {
  it('should return false for expired token', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    // Mock token with expired date
    const result = await verifyToken('test@example.com', 'expired-token')
    expect(result).toBe(false)
  })

  it('should delete token after verification', async () => {
    // Token should only work once
  })
})
```

**Password Reset Flow (TASK-107):**

**Password Reset Utilities (`lib/utils/email.ts`):**
```typescript
// Create password reset token with 1-hour expiry
export async function createPasswordResetToken(email: string): Promise<string> {
  // Delete existing reset tokens
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  })

  const token = generateVerificationToken()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Use reset: prefix to differentiate from verification tokens
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires,
    },
  })

  return token
}

// Verify password reset token (one-time use)
export async function verifyPasswordResetToken(
  email: string,
  token: string
): Promise<boolean> {
  const resetToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: `reset:${email}`,
        token,
      },
    },
  })

  if (!resetToken || resetToken.expires < new Date()) {
    // Delete expired token
    if (resetToken) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: `reset:${email}`,
            token,
          },
        },
      })
    }
    return false
  }

  // Delete token (one-time use)
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: `reset:${email}`,
        token,
      },
    },
  })

  return true
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  await resend.emails.send({
    from: `${APP_NAME} <onboarding@resend.dev>`,
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: `<!-- HTML template with 1-hour expiration notice -->`,
  })
}
```

**Password Reset Server Actions (`lib/actions/auth.actions.ts`):**
```typescript
// Request password reset (forgot password)
export async function requestPasswordReset(
  prevState: unknown,
  formData: FormData
) {
  const validatedData = emailSchema.parse(data)

  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
  })

  // Email enumeration protection - always return success
  if (!user) {
    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    }
  }

  // Prevent password reset for OAuth-only users
  if (!user.password) {
    return {
      success: false,
      message: 'This account uses OAuth sign-in. Please sign in with Google or GitHub.',
    }
  }

  const token = await createPasswordResetToken(validatedData.email)
  await sendPasswordResetEmail(validatedData.email, user.name, token)

  return {
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  }
}

// Reset password with token
export async function resetPassword(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const validatedData = resetPasswordSchema.parse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  // Verify token
  const isValid = await verifyPasswordResetToken(email, token)
  if (!isValid) {
    return {
      success: false,
      message: 'Invalid or expired reset link. Please request a new password reset.',
    }
  }

  // Update password
  const hashedPassword = hashSync(validatedData.password, 10)
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  return {
    success: true,
    message: 'Password reset successfully! You can now sign in with your new password.',
  }
}
```

**Forgot Password Form (`components/auth/forgot-password-form.tsx`):**
```typescript
'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from '@/lib/actions/auth.actions'

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, undefined)

  return (
    <div className="space-y-6">
      {state?.success === true && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="name@example.com"
          required
        />
        <Button type="submit">Send Reset Link</Button>
      </form>
    </div>
  )
}
```

**Reset Password Form (`components/auth/reset-password-form.tsx`):**
```typescript
'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/actions/auth.actions'

export default function ResetPasswordForm({ email, token }) {
  const router = useRouter()
  const [state, formAction] = useActionState(resetPassword, undefined)
  const [password, setPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '',
  })

  // Password strength checker (5-point scale)
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: '' })
      return
    }

    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    let message = '', color = ''
    if (score <= 2) {
      message = 'Weak'
      color = 'bg-red-500'
    } else if (score === 3) {
      message = 'Fair'
      color = 'bg-yellow-500'
    } else if (score === 4) {
      message = 'Good'
      color = 'bg-blue-500'
    } else {
      message = 'Strong'
      color = 'bg-green-500'
    }

    setPasswordStrength({ score, message, color })
  }, [password])

  // Auto-redirect on success
  useEffect(() => {
    if (state?.success === true) {
      setTimeout(() => router.push('/sign-in'), 3000)
    }
  }, [state, router])

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />

      {/* Password with strength indicator */}
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {password && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-full bg-gray-200 rounded-full">
            <div
              className={`h-full ${passwordStrength.color} transition-all`}
              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
            />
          </div>
          <span>{passwordStrength.message}</span>
        </div>
      )}

      <input type="password" name="confirmPassword" required />
      <Button type="submit">Reset Password</Button>
    </form>
  )
}
```

**Password Reset Pages:**
- `/forgot-password` - Email input form with success/error states
- `/reset-password` - Token validation, password input with strength indicator, auto-redirect

**Security Features:**
- ✅ 1-hour token expiration (shorter than email verification for security)
- ✅ One-time use tokens (deleted after verification)
- ✅ Email enumeration protection (consistent success messages)
- ✅ OAuth-only user detection (prevents password reset)
- ✅ Token prefix separation (`reset:` vs regular verification tokens)
- ✅ Password strength requirements enforced
- ✅ Auto-redirect to sign-in on success

**Testing Password Reset:**
```typescript
// Test password reset token
describe('createPasswordResetToken', () => {
  it('should create token with 1-hour expiry', async () => {
    const email = 'test@example.com'
    const now = new Date()

    const token = await createPasswordResetToken(email)

    // Verify 1-hour expiration
    const expiryTime = createCall.data.expires.getTime()
    const expectedExpiry = now.getTime() + 60 * 60 * 1000
    expect(Math.abs(expiryTime - expectedExpiry)).toBeLessThan(1000)
  })

  it('should use reset: prefix', async () => {
    const email = 'test@example.com'
    await createPasswordResetToken(email)

    expect(createCall.data.identifier).toBe(`reset:${email}`)
  })
})

// Test token verification
describe('verifyPasswordResetToken', () => {
  it('should delete expired tokens', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const result = await verifyPasswordResetToken(email, token)

    expect(result).toBe(false)
    expect(prisma.verificationToken.delete).toHaveBeenCalled()
  })

  it('should use one-time tokens', async () => {
    const result = await verifyPasswordResetToken(email, token)

    expect(result).toBe(true)
    expect(prisma.verificationToken.delete).toHaveBeenCalledTimes(1)
  })
})
```

**Header Auth State (TASK-108):**

**User Dropdown Component (`components/shared/header/user-button.tsx`):**
```typescript
'use client'

import { signOutUser } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, ShieldCheck, User, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface UserButtonProps {
  user: {
    name: string
    email: string
    role: string
    image?: string
  }
}

export default function UserButton({ user }: UserButtonProps) {
  const handleSignOut = async () => {
    await signOutUser()
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {/* User Avatar with initials or image */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
            {user.image ? (
              <Image src={user.image} alt={user.name} width={32} height={32} className="rounded-full" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <span className="hidden sm:inline-block">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p>{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Header Menu with Auth State (`components/shared/header/menu.tsx`):**
```typescript
import { auth } from '@/auth'
import UserButton from './user-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const Menu = async () => {
  const session = await auth()

  return (
    <nav className="hidden md:flex w-full max-w-sm gap-3 items-center">
      <MoodToggle />
      <Button asChild variant="ghost">
        <Link href="/cart">
          <ShoppingCart className="w-5 h-5" /> <span>Cart</span>
        </Link>
      </Button>
      {session?.user ? (
        <UserButton user={session.user} />
      ) : (
        <Button asChild>
          <Link href="/sign-in">
            <UserIcon className="w-5 h-5" /> <span>Sign In</span>
          </Link>
        </Button>
      )}
    </nav>
  )
}

export default Menu
```

**Features:**
- ✅ Server component fetches session with `await auth()`
- ✅ Shows "Sign In" button when logged out
- ✅ Shows user avatar with initials or profile image when logged in
- ✅ Dropdown menu with Profile, Orders, Sign Out links
- ✅ Admin users see "Admin Panel" link
- ✅ Mobile menu includes auth state with user info
- ✅ Uses Next.js Image component for optimized avatars
- ✅ Initials generated from user name (first 2 letters)
- ✅ Sign-out action integrated with server action

**Testing Header Auth State:**
```typescript
describe('UserButton', () => {
  it('should display user initials when no image', () => {
    const user = { name: 'John Doe', email: 'john@example.com', role: 'user' }
    render(<UserButton user={user} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should show Admin Panel link for admin users', async () => {
    const adminUser = { name: 'Admin', email: 'admin@example.com', role: 'admin' }
    const user = userEvent.setup()
    render(<UserButton user={adminUser} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  it('should not show Admin Panel for regular users', async () => {
    const regularUser = { name: 'User', email: 'user@example.com', role: 'user' }
    const user = userEvent.setup()
    render(<UserButton user={regularUser} />)

    await user.click(screen.getByRole('button'))
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
  })

  it('should call signOutUser when Sign Out clicked', async () => {
    const user = userEvent.setup()
    render(<UserButton user={mockUser} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Sign Out'))

    expect(signOutUser).toHaveBeenCalledTimes(1)
  })
})
```

#### Forms (React Hook Form + Zod)
- **Installation**: `npm install react-hook-form @hookform/resolvers`
- **Pattern**:
  ```typescript
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {}
  })
  ```
- **Validation**: All forms use Zod schemas from `lib/validations/`

### Folder Structure Updates

**Completed Directories:**
```
app/(auth)/sign-in/                    # Sign-in page ✅
app/(auth)/sign-up/                    # Sign-up page ✅
app/(auth)/verify-email/               # Email verification page ✅
app/(auth)/forgot-password/            # Forgot password page ✅
app/(auth)/reset-password/             # Password reset page ✅
app/api/auth/[...nextauth]/            # Auth.js API routes (OAuth callbacks) ✅
lib/validations/auth.ts                # Auth validation schemas ✅
lib/actions/auth.actions.ts            # Auth server actions ✅
lib/utils/email.ts                     # Email utilities (Resend) ✅
components/auth/                       # Auth form components ✅
components/shared/header/user-button.tsx  # User dropdown with auth state ✅
__tests__/lib/validations/             # Validation schema tests ✅
__tests__/lib/utils/                   # Email utility tests ✅
__tests__/components/auth/             # Auth component tests ✅
__tests__/components/shared/header/    # Header component tests ✅
```

**Pending Directories:**
```
app/(dashboard)/             # User dashboard (profile, orders, addresses)
app/(admin)/                # Admin panel (dashboard, products, orders, users)
app/api/uploadthing/        # File upload route
app/api/webhooks/           # Stripe webhooks
lib/store/                  # Zustand stores
lib/hooks/                  # Custom React hooks
emails/                     # React Email templates
types/                      # Additional TypeScript types (cart, order)
```

### Database Schema Additions

#### Planned Models (See spec.md)
1. **Cart & CartItem** - Shopping cart with items
2. **Order & OrderItem** - Orders with item snapshots
3. **Review** - Product reviews and ratings
4. **Category** (optional) - Product categories

#### Migration Strategy
- Phase-based migrations (one per major feature)
- Always test locally before production
- Use `npx prisma migrate dev --name descriptive_name`
- Update seed data after schema changes

### Development Workflow

#### Phase-Based Development (10 weeks total)
1. **Phase 0**: Bug Fixes & Cleanup (Week 1)
2. **Phase 1**: Authentication (Week 1-2)
3. **Phase 2**: Shopping Cart (Week 2-3)
4. **Phase 3**: Checkout & Orders (Week 3-5)
5. **Phase 4**: Admin Panel (Week 5-6)
6. **Phase 5**: Product Management (Week 6-7)
7. **Phase 6**: Reviews & Ratings (Week 7-8)
8. **Phase 7**: Search & Filters (Week 8-9)
9. **Phase 8**: User Profile (Week 9)
10. **Phase 9**: Polish & SEO (Week 10)

#### Git Workflow
```bash
# Feature branch naming
git checkout -b feature/TASK-XXX-description

# Commit convention
git commit -m "feat: [TASK-XXX] Description"
git commit -m "fix: [TASK-XXX] Description"

# Types: feat, fix, docs, refactor, test, chore
```

#### Testing Strategy
- **Unit Tests**: Utilities and validators (Jest)
- **Integration Tests**: Server actions (Vitest)
- **E2E Tests**: Critical flows like checkout (Playwright - future)
- **Coverage Goals**: Utilities 90%, Actions 80%, Components 70%

### Common Patterns

#### Server Actions
```typescript
'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { revalidatePath } from 'next/cache'

export async function actionName(data: InputType) {
  // 1. Auth check
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // 2. Validation
  const validated = schema.parse(data)

  // 3. Database operation
  const result = await prisma.model.create({ data: validated })

  // 4. Revalidate cache
  revalidatePath('/path')

  // 5. Return serialized data
  return convertToPlainObject(result)
}
```

#### Authentication Forms with useActionState (TASK-104, TASK-105)
```typescript
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { actionName } from '@/lib/actions/file.actions'

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Loading...' : 'Submit'}
    </Button>
  )
}

// Form component with useActionState
export default function Form() {
  const [state, formAction] = useActionState(actionName, undefined)

  return (
    <div>
      {/* Error/Success Message */}
      {state?.success === false && (
        <div className="text-destructive">{state.message}</div>
      )}
      {state?.success === true && (
        <div className="text-green-600">{state.message}</div>
      )}

      {/* Form */}
      <form action={formAction}>
        <input name="field1" required />
        <input name="field2" required />
        <SubmitButton />
      </form>
    </div>
  )
}
```

#### OAuth Form Actions with .bind() (TASK-104, TASK-105)
```typescript
'use client'

import { signInWithOAuth } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'

export default function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Google OAuth */}
      <form action={signInWithOAuth.bind(null, 'google')}>
        <Button type="submit" variant="outline" className="w-full">
          <GoogleIcon />
          Google
        </Button>
      </form>

      {/* GitHub OAuth */}
      <form action={signInWithOAuth.bind(null, 'github')}>
        <Button type="submit" variant="outline" className="w-full">
          <GitHubIcon />
          GitHub
        </Button>
      </form>
    </div>
  )
}

// Server Action
export async function signInWithOAuth(provider: 'google' | 'github') {
  'use server'
  await signIn(provider, { redirectTo: '/dashboard' })
}
```

#### Password Strength Indicator (TASK-104)
```typescript
'use client'

import { useEffect, useState } from 'react'

export default function PasswordField() {
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState({
    score: 0,
    message: '',
    color: '',
  })

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, message: '', color: '' })
      return
    }

    // 5-point scoring system
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    // Determine strength
    let message = '', color = ''
    if (score <= 2) {
      message = 'Weak'
      color = 'bg-red-500'
    } else if (score === 3) {
      message = 'Fair'
      color = 'bg-yellow-500'
    } else if (score === 4) {
      message = 'Good'
      color = 'bg-blue-500'
    } else {
      message = 'Strong'
      color = 'bg-green-500'
    }

    setStrength({ score, message, color })
  }, [password])

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Visual strength indicator */}
      {password && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-full bg-gray-200 rounded-full">
            <div
              className={`h-full ${strength.color} transition-all`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium">{strength.message}</span>
        </div>
      )}
    </div>
  )
}
```

#### Client Components with Server Actions (useTransition)
```typescript
'use client'

import { useState } from 'react'
import { useTransition } from 'react'
import { actionName } from '@/lib/actions/file.actions'
import { toast } from 'sonner'

export function Component() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (data) => {
    startTransition(async () => {
      try {
        await actionName(data)
        toast.success('Success!')
      } catch (error) {
        toast.error(error.message)
      }
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

#### Protected Routes (Middleware)
```typescript
// middleware.ts
import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'admin'

  // Protection logic
})
```

#### Zustand Store Pattern
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreState {
  data: Type[]
  actions: {
    add: (item: Type) => void
    remove: (id: string) => void
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      data: [],
      actions: {
        add: (item) => set((state) => ({ data: [...state.data, item] })),
        remove: (id) => set((state) => ({
          data: state.data.filter(i => i.id !== id)
        })),
      }
    }),
    { name: 'store-name' }
  )
)
```

### Performance Best Practices

1. **Server Components by Default**: Only use 'use client' when needed
2. **Image Optimization**: Always use next/image component
3. **Lazy Loading**: Use dynamic imports for heavy components
4. **Database Indexes**: Add indexes for frequently queried fields
5. **Caching**: Use ISR for product pages (`revalidate: 300`)
6. **Code Splitting**: Automatic per route in App Router

### Security Checklist

- [ ] Environment variables not committed (.env in .gitignore)
- [ ] Auth middleware protects routes
- [ ] Server Actions validate input (Zod)
- [ ] Password hashing (bcrypt, 10 rounds)
- [ ] SQL injection protection (Prisma parameterized queries)
- [ ] XSS protection (React auto-escapes)
- [ ] CSRF protection (Auth.js built-in)
- [ ] Rate limiting on auth endpoints (future)
- [ ] Webhook signature verification (Stripe)

### Environment Variables Needed

```env
# Database
DATABASE_URL=postgresql://...

# Auth.js
NEXTAUTH_SECRET=generate-with-npx-auth-secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...

# Resend
RESEND_API_KEY=...

# App Config (existing)
NEXT_PUBLIC_APP_NAME=Proshopp
NEXT_PUBLIC_APP_DESCRIPTION=...
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
LATEST_PRODUCTS_LIMIT=4
```

### 🔴 COMPREHENSIVE TASK COMPLETION WORKFLOW (MANDATORY)

**NO TASK IS COMPLETE WITHOUT ALL THESE CHECKS PASSING**

#### Step 1: Implementation & Testing
1. Write tests first (TDD - RED phase)
2. Implement code (GREEN phase)
3. Refactor (REFACTOR phase)
4. All tests must pass

#### Step 2: Automated Quality Checks (ALL MANDATORY)
```bash
# Run in sequence - ALL must pass:
npx tsc --noEmit          # ✅ TypeScript check
npm run lint              # ✅ Lint check
npm test                  # ✅ All tests passing
npm test:coverage         # ✅ Coverage threshold met
npm run build             # ✅ Production build succeeds
```

**If ANY check fails, task is NOT complete. Fix and re-run.**

#### Step 3: Manual Validation (For UI Changes)

**🔴 CRITICAL: Clean Environment Protocol (MANDATORY)**

Before EVERY manual validation with Playwright:

```bash
# 1. Kill any process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. Kill any npm dev processes
pkill -f "npm run dev" 2>/dev/null || true

# 3. Close browser (use Playwright MCP)
# Use: mcp__playwright__browser_close

# 4. Start fresh dev server on port 3000 (NOT 3001 or any other port)
npm run dev

# 5. Wait for server to be ready (check for "Ready in..." message)

# 6. Open fresh browser window with Playwright
# Use: mcp__playwright__browser_navigate with http://localhost:3000
```

**⚠️ NEVER use ports other than 3000 for Playwright validation**
- If port 3000 is in use, kill the process first
- Always ensure clean state before validation
- Fresh browser = accurate validation results

**Playwright MCP Validation Checklist:**
- ✅ **Screenshots**: Capture before/after UI state
- ✅ **Console Logs**: Check for errors/warnings (onlyErrors: true)
- ✅ **Network Activity**: Verify API calls and resource loading
- ✅ **Storage**: Inspect cookies, session, localStorage (if applicable)
- ✅ **Visual Verification**: Confirm UI matches requirements
- ✅ **User Interactions**: Test clicks, forms, navigation

```bash
# Example Playwright verification flow:
1. Clean environment (kill processes, close browser)
2. Start dev server on port 3000
3. Navigate to affected page (http://localhost:3000/...)
4. Take screenshot (mcp__playwright__browser_take_screenshot)
5. Check console for errors (mcp__playwright__browser_console_messages)
6. Verify network requests (mcp__playwright__browser_network_requests)
7. Inspect storage state (if needed)
8. Validate user interactions (clicks, forms, etc.)
9. Capture final screenshot
```

#### Step 4: Complex Task Analysis
For complex tasks, use **Sequential Thinking MCP**:
- Break down problem into steps
- Document decision-making process
- Identify edge cases and gotchas
- Record lessons learned

#### Step 5: Documentation Updates
After task completion, update:
- **task.md**: Mark task complete, update progress
- **CLAUDE.md**: Add new patterns/learnings (if applicable)
- **spec.md**: Update if requirements changed
- **plan.md**: Update if architecture changed

Use **Context7 MCP** for documentation review and **Web Search** for latest 2025 best practices.

#### Step 6: Git Commit & Push
```bash
# Create comprehensive commit message (NO Claude/Anthropic signatures)
git add .
git commit -m "feat: [TASK-XXX] Descriptive title

- Detailed change 1
- Detailed change 2
- Tests added/updated
- Documentation updated

Resolves TASK-XXX"

# Push changes
git push origin main
```

**Commit Message Rules:**
- ❌ NO "Generated with Claude Code" signatures
- ❌ NO "Co-Authored-By: Claude" lines
- ✅ Clear, descriptive messages
- ✅ Include task ID
- ✅ List key changes
- ✅ Reference tests and docs

---

### Useful Commands

```bash
# Development
npm run dev                         # Start dev server
npm run build                       # Production build
npm run lint                        # Run ESLint
npx tsc --noEmit                   # Type check

# Testing (🔴 MANDATORY - Set up in TASK-000)
npm test                           # Run all tests
npm test:watch                     # Run tests in watch mode
npm test:coverage                  # Run tests with coverage report
npm test utils.test.ts             # Run specific test file
npm test cart                      # Run tests matching pattern

# Complete Pre-Commit Checklist (ALL must pass)
npx tsc --noEmit && npm run lint && npm test && npm test:coverage && npm run build

# Database
npx prisma studio                   # Open DB GUI
npx prisma migrate dev             # Create migration
npx prisma migrate deploy          # Apply migrations
npx prisma db push                 # Push schema (no migration)
npx prisma generate                # Regenerate client
npx tsx db/seed.ts                 # Seed database

# Auth.js
npx auth secret                     # Generate secret

# Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Ngrok (Stripe Webhook Forwarding)
# ⚠️ IMPORTANT: This project uses ngrok for Stripe webhooks, NOT Stripe CLI
# Ngrok URL: https://uninflected-harper-savable.ngrok-free.dev
# See "Ngrok Setup for Stripe Webhooks" section below for details

# E2E Testing (Phase 9)
npm run test:e2e                   # Run E2E tests
npx playwright test                # Run Playwright tests
npx lighthouse http://localhost:3000  # Performance audit
```

### 🔴 Ngrok Setup for Stripe Webhooks (CRITICAL)

**⚠️ IMPORTANT: This project uses ngrok to expose localhost to Stripe for webhook testing.**

#### Current Configuration
- **Ngrok Public URL**: `https://uninflicted-harper-savable.ngrok-free.dev`
- **Local Port**: `3000` (Next.js dev server)
- **Webhook Endpoint**: `https://uninflicted-harper-savable.ngrok-free.dev/api/webhooks/stripe`
- **Webhook Secret**: Set in `.env` as `STRIPE_WEBHOOK_SECRET`

#### Why Ngrok Instead of Stripe CLI?
- Provides a stable public URL for Stripe to send webhook events
- Works across development sessions
- Easier to configure in Stripe Dashboard
- No need to keep `stripe listen` running

#### Setup Steps (Already Completed)

1. **Install ngrok** (if not already installed):
   ```bash
   brew install ngrok
   ```

2. **Start ngrok tunnel** (keep running during development):
   ```bash
   ngrok http 3000
   ```

3. **Configure Stripe Dashboard**:
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `https://uninflicted-harper-savable.ngrok-free.dev/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
   - Copy webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

4. **Start dev server**:
   ```bash
   npm run dev
   ```

#### Important Notes

**⚠️ DO NOT:**
- Change the ngrok URL without updating Stripe Dashboard webhook endpoint
- Use `stripe listen` command (conflicts with ngrok setup)
- Commit the webhook secret to git
- Use a different port other than 3000

**✅ DO:**
- Keep ngrok running in a separate terminal during development
- Ensure dev server is running on port 3000
- Verify webhook secret matches in both `.env` and Stripe Dashboard
- Test webhooks after any changes to the endpoint

#### Troubleshooting

**Webhooks not received:**
1. Check ngrok is running: Visit `http://localhost:4040` (ngrok dashboard)
2. Verify dev server is running on port 3000
3. Check Stripe Dashboard webhook logs
4. Ensure webhook secret in `.env` matches Stripe Dashboard

**Ngrok URL changed:**
1. Update Stripe Dashboard webhook endpoint with new ngrok URL
2. No need to change webhook secret unless you recreate the endpoint

**Port conflicts:**
1. Kill any process on port 3000: `lsof -ti:3000 | xargs kill -9`
2. Restart ngrok: `ngrok http 3000`
3. Restart dev server: `npm run dev`

#### Development Workflow

```bash
# Terminal 1: Start ngrok
ngrok http 3000

# Terminal 2: Start dev server
npm run dev

# Terminal 3: Development work
# ... your coding ...

# Test webhook:
# Go to Stripe Dashboard → Webhooks → Send test webhook
```

#### Production Setup (Future)

For production deployment:
1. Update Stripe Dashboard webhook endpoint to production URL
2. Generate new webhook secret for production
3. Add production webhook secret to production environment variables
4. Remove ngrok dependency

---

### Resources

- [Project Specification](spec.md) - Feature requirements
- [Implementation Plan](plan.md) - Architecture decisions
- [Task Breakdown](task.md) - Detailed task list
- [Next.js Docs](https://nextjs.org/docs)
- [Auth.js Docs](https://authjs.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Ngrok Docs](https://ngrok.com/docs)
