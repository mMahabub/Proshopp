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
- Remote images configured in `next.config.ts` using `remotePatterns`:
  - `utfs.io` - UploadThing CDN for product images
  - `lh3.googleusercontent.com` - Google OAuth profile pictures (path: `/a/**`)
- Products support multiple images as string arrays
- Next.js Image component optimizes all remote images automatically

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

### Current Completion: 28%
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
- ✅ TASK-201: Cart database models (Cart and CartItem)
- ✅ TASK-202: Zustand cart store with localStorage persistence
- ✅ TASK-203: Cart server actions with stock validation
- ✅ TASK-204: Add to Cart functionality with toast notifications
- ✅ TASK-205: Cart page with item management
- ✅ TASK-206: Cart icon with badge in header (hydration-safe)
- ✅ TASK-207: Cart merge on login (guest cart → database cart)
- ✅ TASK-301: Order database models (Order and OrderItem)
- ✅ TASK-302: Stripe installation and configuration
- ✅ TASK-303: Checkout address page (Step 1 of checkout flow)
- ✅ TASK-304: Payment page with Stripe Elements (Step 2 of checkout flow)

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

#### State Management (Zustand) - ✅ IMPLEMENTED

**Cart Store (TASK-202):**

**Installation:**
```bash
npm install zustand
```

**Cart Types (`types/cart.ts`):**
```typescript
export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string
  stock: number
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}
```

**Cart Store Implementation (`lib/store/cart-store.ts`):**
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartState } from '@/types/cart'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)

          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }

          // Add new item
          return {
            items: [...state.items, { ...item, quantity }],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return {
              items: state.items.filter((i) => i.id !== productId),
            }
          }

          return {
            items: state.items.map((i) =>
              i.id === productId ? { ...i, quantity } : i
            ),
          }
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

**Features:**
- ✅ Client-side state management with Zustand
- ✅ localStorage persistence (survives page reloads)
- ✅ Automatic quantity increment for existing items
- ✅ Auto-remove items when quantity set to 0
- ✅ Real-time total and item count calculation
- ✅ TypeScript type safety
- ✅ Optimistic UI updates

**Usage in Components:**
```typescript
'use client'

import { useCartStore } from '@/lib/store/cart-store'

export default function ProductCard({ product }) {
  const { addItem } = useCartStore()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.images[0],
      stock: product.stock,
    }, 1)
  }

  return (
    <button onClick={handleAddToCart}>Add to Cart</button>
  )
}
```

**Testing:**
```typescript
// 20 comprehensive tests covering:
// - Adding items (new and existing)
// - Removing items
// - Updating quantities (including auto-remove on 0)
// - Clearing cart
// - Calculating totals
// - Counting items
// All tests passing
```

**Pattern:** Client-side state for cart, server state via Server Components

#### Cart Server Actions - ✅ IMPLEMENTED (TASK-203)

**Cart Actions (`lib/actions/cart.actions.ts`):**

```typescript
'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { revalidatePath } from 'next/cache'
import { addToCartSchema, updateCartItemSchema, removeFromCartSchema, syncCartSchema } from '@/lib/validations/cart'

// Get user's cart with all items
export async function getCart() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'You must be signed in to view your cart' }
  }

  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    })
  }

  return { success: true, data: cart }
}

// Sync local cart to database when user signs in
export async function syncCart(items: { productId: string; quantity: number }[]) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'You must be signed in to sync your cart' }
  }

  const validatedData = syncCartSchema.parse({ items })

  let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.user.id } })
  }

  for (const item of validatedData.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product || product.stock < item.quantity) continue

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
    })

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: Math.min(existingItem.quantity + item.quantity, product.stock), price: product.price },
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: item.productId, quantity: item.quantity, price: product.price },
      })
    }
  }

  revalidatePath('/cart')
  return { success: true, message: 'Cart synced successfully' }
}

// Add product to cart with stock validation
export async function addToCart(productId: string, quantity: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'You must be signed in to add items to cart' }
  }

  const validatedData = addToCartSchema.parse({ productId, quantity })

  const product = await prisma.product.findUnique({ where: { id: validatedData.productId } })
  if (!product) {
    return { success: false, message: 'Product not found' }
  }
  if (product.stock < validatedData.quantity) {
    return { success: false, message: `Only ${product.stock} item(s) available in stock` }
  }

  let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.user.id } })
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: validatedData.productId } },
  })

  if (existingItem) {
    const newQuantity = existingItem.quantity + validatedData.quantity
    if (newQuantity > product.stock) {
      return { success: false, message: `Cannot add more items. Only ${product.stock} available in stock` }
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity, price: product.price },
    })
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: validatedData.productId, quantity: validatedData.quantity, price: product.price },
    })
  }

  revalidatePath('/cart')
  return { success: true, message: 'Item added to cart successfully' }
}

// Update cart item quantity
export async function updateCartItem(itemId: string, quantity: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'You must be signed in to update cart items' }
  }

  const validatedData = updateCartItemSchema.parse({ itemId, quantity })

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: validatedData.itemId },
    include: { cart: true, product: true },
  })

  if (!cartItem) {
    return { success: false, message: 'Cart item not found' }
  }
  if (cartItem.cart.userId !== session.user.id) {
    return { success: false, message: 'Unauthorized' }
  }
  if (validatedData.quantity > cartItem.product.stock) {
    return { success: false, message: `Only ${cartItem.product.stock} item(s) available in stock` }
  }

  await prisma.cartItem.update({
    where: { id: validatedData.itemId },
    data: { quantity: validatedData.quantity, price: cartItem.product.price },
  })

  revalidatePath('/cart')
  return { success: true, message: 'Cart item updated successfully' }
}

// Remove item from cart
export async function removeFromCart(itemId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'You must be signed in to remove items from cart' }
  }

  const validatedData = removeFromCartSchema.parse({ itemId })

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: validatedData.itemId },
    include: { cart: true },
  })

  if (!cartItem) {
    return { success: false, message: 'Cart item not found' }
  }
  if (cartItem.cart.userId !== session.user.id) {
    return { success: false, message: 'Unauthorized' }
  }

  await prisma.cartItem.delete({ where: { id: validatedData.itemId } })

  revalidatePath('/cart')
  return { success: true, message: 'Item removed from cart successfully' }
}

// Clear all items from cart
export async function clearCart() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'You must be signed in to clear your cart' }
  }

  const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
  if (!cart) {
    return { success: true, message: 'Cart is already empty' }
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  revalidatePath('/cart')
  return { success: true, message: 'Cart cleared successfully' }
}
```

**Cart Validation Schemas (`lib/validations/cart.ts`):**

```typescript
import { z } from 'zod'

export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1).max(100),
})

export const updateCartItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  quantity: z.number().int().min(1).max(100),
})

export const removeFromCartSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
})

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().int().min(1).max(100),
    })
  ),
})
```

**Features:**
- ✅ Authentication required for all cart operations
- ✅ Stock validation before add/update
- ✅ Auto-create cart on first operation
- ✅ Merge local cart with DB cart on sign-in
- ✅ Ownership validation (users can only modify their own carts)
- ✅ Automatic price updates from product
- ✅ Cache revalidation after mutations
- ✅ Comprehensive error handling
- ✅ Zod schema validation for all inputs

**Testing:**
```typescript
// 25 comprehensive tests covering:
// - All 6 cart actions (getCart, syncCart, addToCart, updateCartItem, removeFromCart, clearCart)
// - Authentication checks
// - Stock validation
// - Ownership validation
// - Error cases
// - All tests passing (146 total tests in project)
```

#### Toast Notifications (Sonner) - ✅ IMPLEMENTED (TASK-204)

**Installation:**
```bash
npm install sonner
```

**Setup in Root Layout (`app/layout.tsx`):**
```typescript
import { Toaster } from "sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
```

**Usage in Components:**
```typescript
import { toast } from 'sonner'

// Success toast
toast.success('Item added to cart')

// Error toast
toast.error('Something went wrong')

// Info toast
toast.info('Please sign in to continue')

// Loading toast
toast.loading('Processing...')
```

**Features:**
- ✅ Rich colors for different toast types
- ✅ Auto-dismiss after 4 seconds
- ✅ Configurable position (top-center, bottom-right, etc.)
- ✅ Stack multiple toasts
- ✅ Lightweight and performant

#### Add to Cart Functionality - ✅ IMPLEMENTED (TASK-204)

**AddToCartButton Component (`components/shared/product/add-to-cart-button.tsx`):**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import { addToCart as addToCartAction } from '@/lib/actions/cart.actions'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
    stock: number
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCartStore()
  const { data: session } = useSession()

  const maxQuantity = Math.min(product.stock, 10)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async () => {
    try {
      setIsLoading(true)

      // Add to local cart store (optimistic update)
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
          stock: product.stock,
        },
        quantity
      )

      toast.success('Added to cart')

      // If user is authenticated, sync to database
      if (session?.user) {
        const result = await addToCartAction(product.id, quantity)

        if (!result.success) {
          toast.error(result.message)
        }
      }
    } catch {
      toast.error('Failed to add item to cart')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center justify-between">
          <label htmlFor="quantity" className="text-sm text-gray-600">
            Quantity
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          >
            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <span>Adding...</span>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  )
}
```

**Usage in Product Page (`app/(root)/product/[slug]/page.tsx`):**

```typescript
import AddToCartButton from '@/components/shared/product/add-to-cart-button'

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug)

  return (
    <div>
      {/* Product details */}

      <AddToCartButton
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          image: product.images[0],
          stock: product.stock,
        }}
      />
    </div>
  )
}
```

**SessionProvider Setup (`components/providers.tsx`):**

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

**Features:**
- ✅ Quantity selector (1 to min(stock, 10))
- ✅ Disabled when out of stock
- ✅ Optimistic UI update (immediate feedback)
- ✅ Sync to database if authenticated
- ✅ Success/error toast notifications
- ✅ Loading state while processing
- ✅ Stock validation
- ✅ Responsive design

**Testing:**
```typescript
// 9 comprehensive tests covering:
// - Quantity selector rendering and limits
// - Out of stock state
// - Adding to cart (authenticated and unauthenticated)
// - Toast notifications
// - Database sync
// - Error handling
// All tests passing (155 total tests in project)
```

**Flow:**
1. User selects quantity (1-10 or max stock)
2. User clicks "Add to Cart"
3. Item immediately added to local cart store (Zustand)
4. Success toast displayed
5. If authenticated, sync to database in background
6. If database sync fails, show error toast

#### Cart Page - ✅ IMPLEMENTED (TASK-205)

**Cart Item Component (`components/shared/cart/cart-item.tsx`):**

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import { removeFromCart, updateCartItem } from '@/lib/actions/cart.actions'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types/cart'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { removeItem, updateQuantity } = useCartStore()
  const { data: session } = useSession()

  const handleQuantityChange = async (newQuantity: number) => {
    try {
      setIsUpdating(true)
      updateQuantity(item.id, newQuantity) // Optimistic update

      if (session?.user) {
        const result = await updateCartItem(item.id, newQuantity)
        if (!result.success) {
          toast.error(result.message)
          updateQuantity(item.id, item.quantity) // Revert on error
        }
      }
    } catch {
      toast.error('Failed to update quantity')
      updateQuantity(item.id, item.quantity)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    removeItem(item.id) // Optimistic update
    toast.success('Item removed from cart')

    if (session?.user) {
      const result = await removeFromCart(item.id)
      if (!result.success) {
        toast.error(result.message)
      }
    }
  }

  const subtotal = item.price * item.quantity

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Product image, name, price */}
      <Link href={`/product/${item.slug}`}>
        <Image src={item.image} alt={item.name} width={96} height={96} />
      </Link>

      <div className="flex-1">
        <h3>{item.name}</h3>
        <p>${item.price.toFixed(2)}</p>

        {/* Quantity selector */}
        <select
          value={item.quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          disabled={isUpdating}
        >
          {Array.from({ length: Math.min(item.stock, 10) }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>

        {/* Subtotal and remove button */}
        <p>${subtotal.toFixed(2)}</p>
        <Button onClick={handleRemove}>Remove</Button>
      </div>
    </div>
  )
}
```

**Cart Summary Component (`components/shared/cart/cart-summary.tsx`):**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'

const TAX_RATE = 0.08 // 8% tax

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default function CartSummary() {
  const router = useRouter()
  const { getTotal } = useCartStore()

  const subtotal = getTotal()
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2>Order Summary</h2>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (8%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <Button onClick={() => router.push('/checkout')}>
        Proceed to Checkout
      </Button>
      <Button onClick={() => router.push('/')} variant="outline">
        Continue Shopping
      </Button>
    </div>
  )
}
```

**Cart Page (`app/(root)/cart/page.tsx`):**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import CartItem from '@/components/shared/cart/cart-item'
import CartSummary from '@/components/shared/cart/cart-summary'
import { ShoppingCart } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { items, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1>Your cart is empty</h1>
          <Button onClick={() => router.push('/')}>Start Shopping</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Shopping Cart ({itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
```

**Features:**
- ✅ Display all cart items with product info
- ✅ Quantity selector (1-10 or max stock)
- ✅ Remove item button with optimistic update
- ✅ Calculate and display subtotal, tax (8%), and total
- ✅ Empty cart state with "Start Shopping" button
- ✅ Responsive layout (grid on desktop, stack on mobile)
- ✅ Database sync for authenticated users
- ✅ Optimistic UI updates with error rollback
- ✅ Currency formatting with commas and decimals

**Testing Summary:**
```bash
npm test

# CartItem component (17 tests):
# - Rendering (product image, name, price, quantity, subtotal)
# - Quantity updates (local store + database sync)
# - Remove item (local store + database sync)
# - Error handling
# - Stock validation

# CartSummary component (10 tests):
# - Display subtotal, tax, total
# - Tax calculation (8%)
# - Currency formatting
# - Navigation (Continue Shopping, Proceed to Checkout)

# Cart page (10 tests):
# - Empty cart state
# - Display cart items
# - Item count in heading
# - Integration with CartItem and CartSummary

# All tests passing (192 total tests in project)
```

**Flow:**
1. User navigates to `/cart`
2. If cart empty: Show empty state with CTA
3. If cart has items: Display items list + summary
4. User can update quantity or remove items
5. Changes sync to Zustand store (optimistic update)
6. If authenticated, sync changes to database
7. User clicks "Proceed to Checkout" → Navigate to checkout
8. User clicks "Continue Shopping" → Navigate to home

#### Cart Icon with Badge - ✅ IMPLEMENTED (TASK-206)

**Cart Icon Component (`components/shared/header/cart-icon.tsx`):**

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartIconProps {
  className?: string
}

export default function CartIcon({ className }: CartIconProps = {}) {
  const { getItemCount } = useCartStore()
  const [itemCount, setItemCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only showing cart count after mount
  useEffect(() => {
    setIsMounted(true)
    setItemCount(getItemCount())
  }, [getItemCount])

  // Subscribe to cart changes after mount
  useEffect(() => {
    if (!isMounted) return

    const unsubscribe = useCartStore.subscribe((state) => {
      setItemCount(state.getItemCount())
    })

    return () => unsubscribe()
  }, [isMounted])

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "flex items-center gap-2 hover:bg-gray-200 transition-all duration-200 rounded-lg px-3 py-2 relative",
        className
      )}
    >
      <Link href="/cart">
        <ShoppingCart className="w-5 h-5" />
        <span>Cart</span>
        {isMounted && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
```

**Hydration-Safe Pattern:**
This component uses a hydration-safe pattern to prevent React hydration errors:

1. **The Problem:** Zustand store uses `localStorage` which isn't available during SSR
   - Server renders with itemCount = 0 (no localStorage)
   - Client hydrates and loads from localStorage (itemCount might be > 0)
   - HTML mismatch → Hydration error ❌

2. **The Solution:** Only render badge after client-side mount
   - `useState(0)` ensures initial render matches server (itemCount = 0)
   - `useEffect` sets `isMounted` to true after mount
   - Badge only renders when `isMounted && itemCount > 0`
   - `useCartStore.subscribe()` updates count on cart changes

3. **Result:** Server HTML matches client HTML → No hydration errors ✅

**Features:**
- ✅ Shopping cart icon (ShoppingCart from lucide-react)
- ✅ Item count badge (hidden when cart is empty)
- ✅ Badge positioned absolutely (-top-1, -right-1)
- ✅ Real-time updates via Zustand store subscription
- ✅ Hydration-safe implementation (prevents SSR/client mismatch)
- ✅ Links to /cart page
- ✅ Customizable styling via className prop
- ✅ Used in both desktop and mobile header menus

**Integration in Menu Component:**

Desktop navigation:
```typescript
<nav className="hidden md:flex w-full max-w-sm gap-3 items-center">
  <MoodToggle />
  <CartIcon />
  {/* User auth buttons */}
</nav>
```

Mobile navigation:
```typescript
<SheetContent>
  <MoodToggle />
  <CartIcon className="w-full hover:bg-gray-100" />
  {/* User menu */}
</SheetContent>
```

**Testing Summary:**
```bash
npm test

# CartIcon component (9 tests - updated for hydration-safe pattern):
# - Rendering (icon, text, link to /cart)
# - Badge display logic with async/await (hidden when count is 0, shown when > 0)
# - Item count updates with waitFor (2, 5, 99 items)
# - Large item counts handling
# - Link behavior
# - Accessibility (accessible link text)

# Tests use waitFor() to handle async useEffect mounting
# All tests passing (201 total tests in project)
```

**Flow:**
1. Component renders with `isMounted = false` and `itemCount = 0` (matches server)
2. After mount, `useEffect` sets `isMounted = true` and loads count from localStorage
3. Badge conditionally renders only when `isMounted && itemCount > 0`
4. Zustand store subscription updates badge in real-time on cart changes
5. Clicking anywhere on the button navigates to `/cart` page
6. Component can be customized with className prop for different contexts

#### Cart Merge on Login - ✅ IMPLEMENTED (TASK-207)

**Overview:**
When a user adds items to their cart while not logged in (guest cart stored in localStorage via Zustand), those items are automatically merged with their database cart when they sign in. This ensures no cart items are lost during the authentication process.

**Implementation Components:**

**1. Server Action (`lib/actions/cart.actions.ts`):**
```typescript
export async function mergeGuestCart(
  guestItems: { productId: string; quantity: number }[]
)
```

**Features:**
- ✅ Validates user authentication
- ✅ Finds or creates user's cart
- ✅ Validates product existence and stock for each guest cart item
- ✅ Merges items by summing quantities for duplicate products
- ✅ Caps merged quantity at available stock
- ✅ Skips items with insufficient stock or non-existent products
- ✅ Returns merged cart with all items and product details
- ✅ Uses Zod validation (syncCartSchema) requiring UUID productId

**2. Cart Store Methods (`lib/store/cart-store.ts`):**
```typescript
// Get cart items in format needed for merging
getCartItemsForSync: () => { productId: string; quantity: number }[]

// Load merged cart from DB and replace localStorage cart
loadCartFromDB: (dbCartItems: DBCartItem[]) => void
```

**3. Client Hook (`lib/hooks/use-cart-merge.ts`):**
```typescript
export function useCartMerge()
```

**Features:**
- ✅ Automatically triggers on user sign-in (status === 'authenticated')
- ✅ Uses `useRef` to ensure merge happens only once per session
- ✅ Only merges if guest cart has items (skips if empty)
- ✅ Resets merge flag on sign-out
- ✅ Handles Prisma Decimal type conversion with proper type assertions

**4. Integration (`components/cart-merge-handler.tsx` & `components/providers.tsx`):**
```typescript
<SessionProvider>
  <CartMergeHandler />  {/* Runs useCartMerge hook */}
  {children}
</SessionProvider>
```

**Merge Flow:**
1. User browses as guest, adds items to cart (stored in localStorage via Zustand)
2. User signs in (Google OAuth, GitHub OAuth, or credentials)
3. `useCartMerge` hook detects `status === 'authenticated'`
4. Hook calls `getCartItemsForSync()` to get guest cart items
5. Server action `mergeGuestCart()` processes each item:
   - Validates product exists and has sufficient stock
   - If product already in DB cart: adds quantities (capped at stock)
   - If new product: creates new cart item
   - Skips invalid products or insufficient stock
6. Server returns merged cart with all items
7. Hook calls `loadCartFromDB()` to replace localStorage cart with merged DB cart
8. User sees all their items (both guest and previous) in cart

**Type Definitions (`types/cart.ts`):**
```typescript
export interface DBCartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  price: Decimal  // Prisma Decimal type
  product: {
    id: string
    name: string
    slug: string
    price: Decimal
    stock: number
    images: string[]
  }
}

export interface CartState {
  // ... existing methods
  getCartItemsForSync: () => { productId: string; quantity: number }[]
  loadCartFromDB: (dbCartItems: DBCartItem[]) => void
}
```

**Testing (`__tests__/lib/actions/cart-merge.test.ts`):**
```bash
npm test

# Cart Merge Tests (10 tests):
# - Authentication requirement
# - Empty guest cart handling
# - Cart creation for new users
# - Item merging with empty DB cart
# - Quantity summing for duplicate items
# - Stock validation (insufficient stock)
# - Stock validation (cap merged quantity at available stock)
# - Non-existent product handling
# - Return value structure

# All tests use proper UUID mocks for productId validation
# All tests mock revalidatePath to avoid Next.js static generation errors
```

**Key Implementation Details:**
- **Prisma Decimal Handling:** Uses type assertion `as unknown as DBCartItem[]` for Decimal conversion
- **Hydration Safety:** Hook only runs client-side after session loads
- **One-Time Execution:** `useRef` prevents duplicate merges during session
- **Stock Safety:** Never exceeds available product stock
- **Error Handling:** Gracefully skips invalid items, continues with valid ones
- **Validation:** Uses existing `syncCartSchema` requiring UUID productIds

**Testing Improvements:**
- Added `jest.mock('next/cache')` to mock `revalidatePath`
- Used valid UUIDs in test fixtures (e.g., `'550e8400-e29b-41d4-a716-446655440000'`)
- Added global Request/Response polyfills in `jest.setup.js` for Next.js compatibility
- Fixed `prisma.cart.findUnique` mocks to account for both initial and final cart fetch

**File Changes:**
- ✅ `lib/actions/cart.actions.ts` - Added `mergeGuestCart` function
- ✅ `lib/store/cart-store.ts` - Added `getCartItemsForSync` and `loadCartFromDB`
- ✅ `lib/hooks/use-cart-merge.ts` - Created cart merge hook
- ✅ `components/cart-merge-handler.tsx` - Created handler component
- ✅ `components/providers.tsx` - Integrated CartMergeHandler
- ✅ `types/cart.ts` - Added `DBCartItem` interface and CartState methods
- ✅ `__tests__/lib/actions/cart-merge.test.ts` - Comprehensive test suite (10 tests)
- ✅ `jest.setup.js` - Added Request/Response polyfills and TextEncoder/TextDecoder

#### Payment Integration (Stripe) - ✅ CONFIGURED (TASK-302)

**Installation:**
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Dependencies Installed:**
- ✅ `stripe` (v18+) - Server-side Stripe SDK for payment intents, customers, etc.
- ✅ `@stripe/stripe-js` - Client-side Stripe.js loader (publishable key)
- ✅ `@stripe/react-stripe-js` - React components for Stripe Elements

**Configuration Files:**

**Server-Side Configuration (`lib/utils/stripe.ts`):**
```typescript
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

/**
 * Stripe instance configured for server-side operations
 * - Uses secret key for full API access
 * - Configured for API version 2025-09-30.clover
 * - TypeScript enabled for type safety
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

/**
 * Convert dollars to cents for Stripe API
 * @param amount - Amount in dollars
 * @returns Amount in cents (smallest currency unit)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert cents to dollars from Stripe API
 * @param amount - Amount in cents
 * @returns Amount in dollars
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}
```

**Client-Side Configuration (`lib/utils/stripe-client.ts`):**
```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables'
  )
}

/**
 * Singleton Stripe instance for client-side operations
 * - Lazy loaded on first call
 * - Cached to prevent multiple loadStripe calls
 * - Uses publishable key (safe to expose to client)
 */
let stripePromise: Promise<Stripe | null>

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
  }
  return stripePromise
}
```

**Environment Variables (`.env`):**
```env
# Stripe Secret Key (Server-Side Only)
# Get from: https://dashboard.stripe.com/apikeys
# Use test mode keys for development (starts with sk_test_)
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"

# Stripe Publishable Key (Client-Side Safe)
# Get from: https://dashboard.stripe.com/apikeys
# Use test mode keys for development (starts with pk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"

# Stripe Webhook Secret (for webhook signature verification)
# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

**Key Features:**
- ✅ **Server-Side**: Full Stripe API access with secret key
- ✅ **Client-Side**: Secure publishable key for Stripe.js
- ✅ **Singleton Pattern**: Client-side Stripe instance cached to prevent redundant loading
- ✅ **Currency Utilities**: Convert between dollars and cents (Stripe uses smallest currency unit)
- ✅ **TypeScript**: Full type safety with Stripe SDK types
- ✅ **Latest API Version**: 2025-09-30.clover
- ✅ **Environment Validation**: Throws errors if keys are missing

**Usage Examples:**

**Server Actions (Payment Intent):**
```typescript
'use server'

import { stripe, formatAmountForStripe } from '@/lib/utils/stripe'
import { auth } from '@/auth'

export async function createPaymentIntent(amount: number) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount), // Convert $10.99 → 1099 cents
      currency: 'usd',
      metadata: {
        userId: session.user.id,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    return { success: false, message: 'Failed to create payment intent' }
  }
}
```

**Client Component (Checkout Form):**
```typescript
'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/utils/stripe-client'
import CheckoutForm from './checkout-form'

export default function CheckoutPage({ clientSecret }: { clientSecret: string }) {
  const stripePromise = getStripe()

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  )
}
```

**Testing:**
```bash
npm test

# Stripe Tests (17 tests):
# - Server-side currency conversion (dollars ↔ cents)
# - Round-trip conversion precision
# - Client-side Stripe loader singleton pattern
# - Concurrent call handling
# - Null handling
# All tests passing (227 total tests)
```

**Security Best Practices:**
- ✅ **Never expose secret key**: Only use in server-side code
- ✅ **Use test keys in development**: Start with `sk_test_` and `pk_test_`
- ✅ **Webhook signature verification**: Validate webhook authenticity (see webhook section)
- ✅ **Environment variable validation**: Fail fast if keys are missing
- ✅ **Client-side safety**: Only publishable key exposed to browser

**Next Steps:**
- **TASK-303**: Create checkout address page
- **TASK-304**: Create payment page with Stripe Elements
- **TASK-307**: Create Stripe webhook handler for payment events

**Resources:**
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Cards](https://stripe.com/docs/testing#cards)
- [Stripe Elements React](https://stripe.com/docs/stripe-js/react)

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
lib/store/cart-store.ts                # Zustand cart store with localStorage ✅
types/cart.ts                          # Cart type definitions ✅
__tests__/lib/store/                   # Cart store tests ✅
lib/actions/cart.actions.ts            # Cart server actions with stock validation ✅
lib/validations/cart.ts                # Cart validation schemas ✅
__tests__/lib/actions/cart.actions.test.ts  # Cart actions tests ✅
__mocks__/auth.ts                      # Auth mock for testing ✅
components/shared/product/add-to-cart-button.tsx  # Add to cart button with quantity selector ✅
components/providers.tsx               # Client providers wrapper (SessionProvider) ✅
__tests__/components/shared/product/add-to-cart-button.test.tsx  # Add to cart button tests ✅
__mocks__/next-auth/react.ts           # next-auth mock for testing ✅
__mocks__/sonner.ts                    # Sonner toast mock for testing ✅
app/(root)/cart/page.tsx               # Cart page with item management ✅
components/shared/cart/cart-item.tsx   # Cart item component with quantity/remove ✅
components/shared/cart/cart-summary.tsx  # Cart summary with totals and CTAs ✅
__tests__/app/(root)/cart/page.test.tsx  # Cart page tests ✅
__tests__/components/shared/cart/cart-item.test.tsx  # Cart item tests ✅
__tests__/components/shared/cart/cart-summary.test.tsx  # Cart summary tests ✅
```

**Pending Directories:**
```
app/(dashboard)/             # User dashboard (profile, orders, addresses)
app/(admin)/                # Admin panel (dashboard, products, orders, users)
app/api/uploadthing/        # File upload route
app/api/webhooks/           # Stripe webhooks
lib/hooks/                  # Custom React hooks
emails/                     # React Email templates
```

### Database Schema

#### Current Models

**Shopping Cart (TASK-201):**
```prisma
model Cart {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @unique @db.Uuid
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @updatedAt

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]

  @@index([userId])
}

model CartItem {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  cartId    String   @db.Uuid
  productId String   @db.Uuid
  quantity  Int      @default(1)
  price     Decimal  @db.Decimal(12, 2)  // Snapshot of price at time of adding
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @updatedAt

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])  // One product per cart
  @@index([cartId])
  @@index([productId])
}
```

**Features:**
- ✅ One-to-one relationship between User and Cart (each user has one cart)
- ✅ Cart items link to both Cart and Product
- ✅ Price snapshot stored in CartItem (preserves price at time of adding)
- ✅ Unique constraint prevents duplicate products in same cart
- ✅ Cascade delete removes cart when user deleted
- ✅ Cascade delete removes cart items when cart or product deleted
- ✅ Indexes for performance on foreign keys

**Migration:**
```bash
npx prisma migrate dev --name add_cart_models
# Applied: 20251005220902_add_cart_models
```

**Order & OrderItem (TASK-301):**
```prisma
model Order {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderNumber     String    @unique
  userId          String    @db.Uuid
  status          String    @default("pending")  // pending, paid, shipped, delivered, cancelled
  subtotal        Decimal   @db.Decimal(12, 2)
  tax             Decimal   @db.Decimal(12, 2)
  shippingCost    Decimal   @default(0) @db.Decimal(12, 2)
  totalPrice      Decimal   @db.Decimal(12, 2)
  shippingAddress Json      @db.Json  // Snapshot of address at time of order
  paymentMethod   String?
  paymentResult   Json?     @db.Json  // Stripe payment details
  isPaid          Boolean   @default(false)
  paidAt          DateTime? @db.Timestamp(6)
  isDelivered     Boolean   @default(false)
  deliveredAt     DateTime? @db.Timestamp(6)
  createdAt       DateTime  @default(now()) @db.Timestamp(6)
  updatedAt       DateTime  @updatedAt

  user  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([orderNumber])
}

model OrderItem {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId   String   @db.Uuid
  productId String   @db.Uuid
  name      String   // Product snapshot - preserves product info at time of order
  slug      String
  image     String
  price     Decimal  @db.Decimal(12, 2)
  quantity  Int
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @updatedAt

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([productId])
}
```

**Features:**
- ✅ One-to-many relationship between User and Orders (users can have multiple orders)
- ✅ Order items snapshot product information at time of purchase (name, slug, image, price)
- ✅ Order number for easy reference and tracking
- ✅ Comprehensive order status tracking (pending → paid → shipped → delivered)
- ✅ Payment tracking with isPaid flag and paidAt timestamp
- ✅ Delivery tracking with isDelivered flag and deliveredAt timestamp
- ✅ Shipping address stored as JSON snapshot (preserves address at time of order)
- ✅ Payment result stored as JSON for Stripe integration
- ✅ Price breakdown: subtotal, tax, shipping cost, and total price
- ✅ Cascade delete removes order items when order deleted
- ✅ Restrict delete prevents product deletion if referenced in orders (data integrity)
- ✅ Indexes for performance on userId, status, orderNumber, and foreign keys

**Migration:**
```bash
npx prisma migrate dev --name add_order_models
# Applied: 20251006012233_add_order_models
```

**Design Decisions:**
- **Product Snapshots**: OrderItem stores product name, slug, image, and price to preserve order history even if products are updated or deleted later
- **Address Snapshot**: shippingAddress stored as JSON to capture full address at time of order, independent of user's current address
- **Payment Result**: Stored as JSON to accommodate various Stripe response formats
- **Order Status**: String field allows for flexible workflow (pending/paid/shipped/delivered/cancelled)
- **Restrict on Product Delete**: Prevents accidental deletion of products that appear in historical orders
- **Multiple Indexes**: Optimized for common queries (user's orders, orders by status, order number lookup)

#### Planned Models (See spec.md)
1. ✅ **Cart & CartItem** - Shopping cart with items (COMPLETED - TASK-201)
2. ✅ **Order & OrderItem** - Orders with item snapshots (COMPLETED - TASK-301)
3. **Review** - Product reviews and ratings
4. **Category** (optional) - Product categories

#### Migration Strategy
- Phase-based migrations (one per major feature)
- Always test locally before production
- Use `npx prisma migrate dev --name descriptive_name`
- Update seed data after schema changes
- Verify with `npx prisma migrate status` and `npx prisma validate`

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

### Checkout Flow (TASK-303) - ✅ IMPLEMENTED

#### Overview
Multi-step checkout process with shipping address collection, progress tracking, and cookie-based state management.

**Files Created:**
- `app/(root)/checkout/page.tsx` - Checkout address page (Step 1)
- `app/(root)/checkout/layout.tsx` - Checkout layout with metadata
- `components/checkout/address-form.tsx` - Shipping address form component
- `components/checkout/checkout-steps.tsx` - Progress indicator component
- `lib/validations/checkout.ts` - Address validation schema
- `lib/actions/checkout.actions.ts` - Checkout server actions

**Tests Created:**
- `__tests__/lib/validations/checkout.test.ts` - 48 validation tests
- `__tests__/components/checkout/address-form.test.tsx` - 23 component tests
- `__tests__/app/checkout/checkout-page.test.tsx` - 5 page tests

#### Address Validation Schema

```typescript
// lib/validations/checkout.ts
import { z } from 'zod'

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  streetAddress: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be less than 200 characters'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must be less than 100 characters'),
  postalCode: z
    .string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be less than 20 characters')
    .regex(/^[A-Za-z0-9\s\-]+$/, 'Invalid postal code format'),
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be less than 100 characters'),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
```

#### Address Form Component

**Features:**
- Six form fields: Full Name, Street Address, City, State/Province, Postal Code, Country
- Server action integration with `useActionState` hook
- Loading state with pending button text
- Responsive grid layout for city/state and postal/country
- Default values support for pre-filling
- Error and success message display
- Accessibility: proper labels, required attributes, keyboard navigation

**Usage:**
```typescript
import AddressForm from '@/components/checkout/address-form'

// With default values
<AddressForm
  defaultValues={{
    fullName: 'John Doe',
    streetAddress: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
  }}
/>

// Empty form
<AddressForm />
```

#### Checkout Steps Component

**Features:**
- Visual progress indicator with 3 steps: Address → Payment → Review
- Shows current step with primary color
- Completed steps marked with checkmark icon
- Future steps shown in muted color
- Connector lines between steps
- Responsive design (mobile/desktop layouts)

**Usage:**
```typescript
import CheckoutSteps from '@/components/checkout/checkout-steps'

<CheckoutSteps currentStep={1} /> // Address step
<CheckoutSteps currentStep={2} /> // Payment step
<CheckoutSteps currentStep={3} /> // Review step
```

#### Server Actions

**`saveShippingAddress`**:
- Validates address data using Zod schema
- Stores address in HTTP-only cookie (24-hour expiry)
- Redirects to `/checkout/payment` on success
- Returns error message on validation failure

**`getShippingAddress`**:
- Retrieves stored address from cookie
- Validates and returns parsed address
- Returns `null` if no address found or invalid

```typescript
// lib/actions/checkout.actions.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { shippingAddressSchema } from '@/lib/validations/checkout'

export async function saveShippingAddress(prevState: unknown, formData: FormData) {
  try {
    const data = {
      fullName: formData.get('fullName') as string,
      streetAddress: formData.get('streetAddress') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string,
    }

    const validatedData = shippingAddressSchema.parse(data)

    const cookieStore = await cookies()
    cookieStore.set('shipping_address', JSON.stringify(validatedData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    redirect('/checkout/payment')
  } catch (error) {
    // Error handling
  }
}
```

#### Checkout Page Structure

```typescript
// app/(root)/checkout/page.tsx
import CheckoutSteps from '@/components/checkout/checkout-steps'
import AddressForm from '@/components/checkout/address-form'

export default function CheckoutPage() {
  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <CheckoutSteps currentStep={1} />

      {/* Address Form */}
      <div className="mx-auto max-w-2xl">
        <AddressForm />
      </div>
    </div>
  )
}
```

#### Checkout Layout

```typescript
// app/(root)/checkout/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout - Proshopp',
  description: 'Complete your purchase securely',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6">
      {children}
    </div>
  )
}
```

#### Testing Summary

**Validation Tests (48 tests):**
- Full name validation (min/max length, edge cases)
- Street address validation (apartments/units, length)
- City validation (min/max, international names)
- State validation (abbreviations, full names)
- Postal code validation (US ZIP, ZIP+4, UK, Canadian formats)
- Country validation (abbreviations, full names)
- International address support (German, Japanese, Australian)
- Edge cases (null, undefined, partial data, whitespace)

**Component Tests (23 tests):**
- Form fields rendering
- Required attributes
- Input types and names
- Placeholder text
- Labels and headers
- Submit button states
- Default values population
- Grid layout structure
- Accessibility (label associations, keyboard navigation)

**Page Tests (5 tests):**
- Checkout steps rendering
- Address form rendering
- Current step indicator
- Layout structure
- Max-width container

#### Middleware Protection

Checkout routes require authentication (already configured in `middleware.ts`):

```typescript
const isCheckoutRoute = nextUrl.pathname.startsWith('/checkout')

if (isCheckoutRoute && !isLoggedIn) {
  return NextResponse.redirect(new URL('/sign-in', request.url))
}
```

#### Next Steps

**Upcoming checkout tasks:**
- TASK-304: Create payment page with Stripe Elements  ← **COMPLETED**
- TASK-305: Create order review page
- TASK-306: Create order server actions
- TASK-307: Create Stripe webhook handler
- TASK-308: Create order confirmation page
- TASK-309: Create order history page

---

### Payment Page (TASK-304) - ✅ IMPLEMENTED

#### Overview
Stripe-integrated payment page (Step 2 of checkout) with payment intent creation, order summary display, and secure payment processing using Stripe Elements.

**Files Created:**
- `app/(root)/checkout/payment/page.tsx` - Payment page with order summary
- `components/checkout/payment-form.tsx` - Payment form with Stripe Elements
- `components/checkout/stripe-provider.tsx` - Client component wrapper for Stripe Elements
- `lib/actions/payment.actions.ts` - Payment server actions

**Tests Created:**
- `__tests__/lib/actions/payment.actions.test.ts` - 17 payment action tests
- `__tests__/components/checkout/payment-form.test.tsx` - 17 component tests (4 skipped)
- `__tests__/app/checkout/payment-page.test.tsx` - 19 page tests

#### Payment Server Actions

**`createPaymentIntent()`**:
- Gets authenticated user's cart with items
- Validates shipping address exists
- Calculates subtotal, tax (10%), and total
- Creates Stripe payment intent with automatic payment methods
- Stores user and cart metadata
- Returns client secret for payment processing

**`getPaymentDetails()`**:
- Retrieves cart items for order summary
- Calculates pricing breakdown (subtotal, tax, total)
- Returns formatted payment details

```typescript
// lib/actions/payment.actions.ts
'use server'

import { auth } from '@/auth'
import { stripe, formatAmountForStripe } from '@/lib/utils/stripe'
import { getCart } from '@/lib/actions/cart.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'

export async function createPaymentIntent() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'You must be signed in to proceed with payment' }
    }

    const cartResult = await getCart()
    if (!cartResult.success || !cartResult.data) {
      return { success: false, message: 'Your cart is empty' }
    }

    const cart = cartResult.data

    // Calculate total from cart items
    let subtotal = 0
    for (const item of cart.items) {
      const itemPrice = parseFloat(item.price.toString())
      subtotal += itemPrice * item.quantity
    }

    const taxRate = 0.1
    const tax = subtotal * taxRate
    const total = subtotal + tax

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(total),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: session.user.id,
        cartId: cart.id,
      },
    })

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: total,
        subtotal,
        tax,
      },
    }
  } catch (error) {
    return { success: false, message: 'Failed to create payment intent' }
  }
}
```

#### Payment Form Component

**Features:**
- Stripe PaymentElement with automatic payment methods
- Real-time payment processing with loading states
- Error handling for card errors, validation errors, and network issues
- Success redirect to confirmation page
- Accessible form controls and error messages
- Test card information display

**Usage:**
```typescript
// Used via StripeProvider wrapper
<StripeProvider clientSecret={clientSecret} amount={amount} />
```

**Implementation:**
```typescript
// components/checkout/payment-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function PaymentForm({ amount }: { amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (error) {
      setErrorMessage(error.message || 'An error occurred')
    }
    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border p-4">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={!stripe || !elements || isProcessing} className="w-full" size="lg">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Test card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits
      </p>
    </form>
  )
}
```

#### Stripe Provider Component

Client component wrapper for Stripe Elements to work with Server Components:

```typescript
// components/checkout/stripe-provider.tsx
'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/utils/stripe-client'
import PaymentForm from '@/components/checkout/payment-form'

export default function StripeProvider({
  clientSecret,
  amount
}: {
  clientSecret: string
  amount: number
}) {
  const stripePromise = getStripe()

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
      }}
    >
      <PaymentForm amount={amount} />
    </Elements>
  )
}
```

#### Payment Page Structure

**Features:**
- Order summary with cart items, images, and quantities
- Price breakdown (subtotal, tax, total)
- Shipping address display
- Stripe payment form integration
- Responsive two-column layout (order summary + payment form)
- Redirects if shipping address or cart is missing

```typescript
// app/(root)/checkout/payment/page.tsx
import { redirect } from 'next/navigation'
import CheckoutSteps from '@/components/checkout/checkout-steps'
import StripeProvider from '@/components/checkout/stripe-provider'
import { createPaymentIntent, getPaymentDetails } from '@/lib/actions/payment.actions'
import { getShippingAddress } from '@/lib/actions/checkout.actions'

export default async function PaymentPage() {
  // Check if shipping address exists
  const shippingAddress = await getShippingAddress()
  if (!shippingAddress) {
    redirect('/checkout')
  }

  // Get payment details for order summary
  const paymentDetailsResult = await getPaymentDetails()
  if (!paymentDetailsResult.success || !paymentDetailsResult.data) {
    redirect('/cart')
  }

  const { items, subtotal, tax, total } = paymentDetailsResult.data

  // Create payment intent
  const paymentIntentResult = await createPaymentIntent()
  if (!paymentIntentResult.success || !paymentIntentResult.data) {
    redirect('/cart')
  }

  const { clientSecret, amount } = paymentIntentResult.data

  return (
    <div className="space-y-8">
      <CheckoutSteps currentStep={2} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Summary - Left Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${formatNumberWithDecimal(parseFloat(item.price.toString()) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${formatNumberWithDecimal(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${formatNumberWithDecimal(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${formatNumberWithDecimal(total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{shippingAddress.fullName}</p>
                  <p>{shippingAddress.streetAddress}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form - Right Column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <StripeProvider clientSecret={clientSecret} amount={amount} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

#### Testing Summary

**Payment Action Tests (17 tests):**
- Payment intent creation success
- Tax and total calculation (10% tax rate)
- Authentication validation
- Empty cart handling
- Shipping address validation
- Stripe metadata passing
- Currency and payment methods configuration
- Payment details retrieval
- Multiple cart items calculation

**Payment Form Tests (17 tests, 4 skipped):**
- Form rendering with PaymentElement
- Submit button states and loading
- Amount formatting (decimal places)
- Error message display (card errors, validation errors)
- Accessibility (form labels, keyboard navigation)
- Payment submission with confirmPayment
- Note: Payment intent status check tests skipped (complex window.location mocking)

**Payment Page Tests (19 tests):**
- Checkout steps display (Step 2)
- Order summary rendering
- Cart items display with images and quantities
- Price breakdown (subtotal, tax, total)
- Shipping address display
- Redirect scenarios (no address, empty cart, payment intent failure)
- Responsive grid layout
- Stripe Elements integration

#### Security Features

**Payment Security:**
- HTTP-only cookies for checkout state
- Stripe Payment Intents for PCI compliance
- Automatic payment methods (cards, wallets)
- Client secret validation
- Server-side payment intent creation
- Metadata tracking (userId, cartId)

**Access Control:**
- Authentication required (middleware)
- Cart ownership validation
- Shipping address validation before payment
- Redirect to appropriate pages on missing data

#### Stripe Test Cards

**Success:**
- `4242 4242 4242 4242` - Visa (succeeds)
- Any future expiration date
- Any 3-digit CVC

**Decline:**
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

#### Next Implementation Steps

**Remaining checkout tasks:**
- TASK-305: Create order review page
- TASK-306: Create order server actions
- TASK-307: Create Stripe webhook handler
- TASK-308: Create order confirmation page
- TASK-309: Create order history page

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
