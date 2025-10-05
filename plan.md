# Proshopp - Implementation Plan

**Version:** 1.1 (Test-First Update)
**Last Updated:** October 4, 2025
**Project Phase:** Development (18% → 100%)
**Testing Approach:** 🔴 MANDATORY - Test-First Development (TDD/Test-Driven)

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Decisions](#technology-decisions)
3. [Project Structure](#project-structure)
4. [Development Strategy](#development-strategy)
5. [State Management](#state-management)
6. [Authentication Strategy](#authentication-strategy)
7. [Payment Integration](#payment-integration)
8. [File Upload Strategy](#file-upload-strategy)
9. [Database Migration Plan](#database-migration-plan)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Strategy](#deployment-strategy)

---

## Architecture Overview

### Design Principles
1. **Test-First Development**: 🔴 Write tests before implementation (TDD) - MANDATORY
2. **Simple Over Complex**: Avoid over-engineering, use proven patterns
3. **Server-First**: Leverage Next.js server components and server actions
4. **Progressive Enhancement**: Start with server-rendered, enhance with client interactivity
5. **Type Safety**: TypeScript strict mode, Zod validation at boundaries
6. **Performance**: Code splitting, lazy loading, optimistic updates

### Architecture Pattern
**Monolith with Modular Structure**
- Single Next.js application
- Server Actions for backend logic
- Server Components as default
- Client Components when interactivity needed
- No separate API layer (unless needed for mobile app in future)

### Request Flow
```
Client Request
    ↓
Next.js Server Component (SSR)
    ↓
Server Action (mutation)
    ↓
Prisma ORM
    ↓
Neon PostgreSQL
    ↓
Response → Client
```

---

## Technology Decisions

### Core Stack (Already in Use)
✅ **Next.js 15**: App Router, Server Components, Server Actions
✅ **React 19**: Latest features, use-optimistic hooks
✅ **TypeScript 5**: Strict mode, full type coverage
✅ **Prisma 6**: ORM with type safety
✅ **PostgreSQL**: Neon serverless
✅ **Tailwind CSS**: Utility-first styling
✅ **shadcn/ui**: Pre-built accessible components

### New Additions Required

#### 1. Authentication: **Auth.js v5** (formerly NextAuth.js)
**Why Auth.js v5?**
- Official Next.js 15 support
- Works with App Router and Server Actions
- Built-in OAuth providers (Google, GitHub)
- Email verification support
- Session management
- Role-based access control

**Installation:**
```bash
npm install next-auth@beta @auth/prisma-adapter
```

**Configuration:**
- File: `auth.ts` (root)
- Adapter: Prisma (already have schema)
- Providers: Credentials, Google, GitHub
- Session strategy: JWT

---

#### 2. State Management: **Zustand**
**Why Zustand?**
- Minimal boilerplate (vs Redux)
- No context provider needed
- TypeScript-first
- Middleware support (persist, devtools)
- Perfect for cart state

**Installation:**
```bash
npm install zustand
```

**Stores Needed:**
- `useCartStore`: Cart items, add/remove/update
- `useUserStore`: User preferences (optional)

**Pattern:**
```typescript
// lib/store/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      // ... other actions
    }),
    { name: 'cart-storage' }
  )
)
```

---

#### 3. Forms: **React Hook Form + Zod**
**Why React Hook Form?**
- Already using Zod for validation
- Minimal re-renders
- Built-in error handling
- TypeScript integration

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers
```

**Pattern:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(signUpSchema),
  defaultValues: { email: '', password: '' }
})
```

---

#### 4. Payments: **Stripe**
**Why Stripe?**
- Industry standard
- Excellent Next.js integration
- Built-in fraud detection
- Supports subscriptions (future)
- Great developer experience

**Installation:**
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Components:**
- Server Action: Create payment intent
- Client Component: Stripe Elements form
- Webhook: Handle payment events

**Flow:**
1. User clicks "Place Order"
2. Server Action creates Stripe Payment Intent
3. Client mounts Stripe Elements with client secret
4. User enters card details
5. Stripe confirms payment
6. Webhook updates order status
7. Redirect to success page

---

#### 5. Email: **Resend**
**Why Resend?**
- Built for developers
- React email templates
- Simple API
- Free tier (100 emails/day)

**Installation:**
```bash
npm install resend react-email
```

**Email Templates:**
- Welcome email (after sign-up)
- Email verification
- Password reset
- Order confirmation
- Shipping notification

---

#### 6. File Upload: **UploadThing**
**Why UploadThing?**
- Already configured (utfs.io in next.config.ts)
- Free tier (2GB storage)
- Next.js optimized
- Type-safe uploads

**Installation:**
```bash
npm install uploadthing @uploadthing/react
```

**Usage:**
- Product images (admin panel)
- User profile images
- Max 5 images per product

---

#### 7. Additional Utilities

**Sonner** - Toast notifications
```bash
npm install sonner
```

**date-fns** - Date formatting
```bash
npm install date-fns
```

**@tanstack/react-table** - Admin data tables (future)
```bash
npm install @tanstack/react-table
```

---

## Project Structure

### Folder Organization

```
proshopp/
├── app/
│   ├── (root)/              # Public pages
│   │   ├── page.tsx         # Homepage
│   │   ├── product/
│   │   │   └── [slug]/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── search/
│   ├── (auth)/              # Auth pages (no header/footer)
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── verify-email/
│   │   └── reset-password/
│   ├── (dashboard)/         # User dashboard
│   │   ├── profile/
│   │   ├── orders/
│   │   └── addresses/
│   ├── (admin)/             # Admin panel
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── users/
│   └── api/
│       ├── uploadthing/
│       └── webhooks/
│           └── stripe/
├── components/
│   ├── ui/                  # shadcn components
│   ├── shared/
│   │   ├── header/
│   │   ├── footer/
│   │   ├── product/
│   │   └── cart/
│   ├── auth/                # Auth forms
│   ├── checkout/            # Checkout steps
│   └── admin/               # Admin components
├── lib/
│   ├── actions/
│   │   ├── auth.actions.ts
│   │   ├── product.actions.ts
│   │   ├── cart.actions.ts
│   │   ├── order.actions.ts
│   │   └── admin.actions.ts
│   ├── store/
│   │   └── cart-store.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── review.ts
│   ├── utils/
│   │   ├── index.ts         # Existing utils
│   │   ├── stripe.ts
│   │   └── email.ts
│   ├── constants/
│   └── hooks/
│       ├── use-cart.ts
│       └── use-user.ts
├── types/
│   ├── index.ts
│   ├── auth.ts
│   ├── cart.ts
│   └── order.ts
├── db/
│   ├── prisma.ts
│   ├── seed.ts
│   └── sample-data.ts
├── prisma/
│   └── schema.prisma
├── emails/                  # React Email templates
│   ├── welcome.tsx
│   ├── order-confirmation.tsx
│   └── password-reset.tsx
└── public/
    └── images/
```

### Route Groups Strategy

#### `(root)` - Public Routes
- No authentication required
- Includes Header + Footer
- Layout: `app/(root)/layout.tsx`

#### `(auth)` - Authentication Pages
- No Header/Footer (clean layout)
- Redirects to dashboard if authenticated
- Layout: `app/(auth)/layout.tsx`

#### `(dashboard)` - User Dashboard
- Requires authentication
- User-specific pages
- Layout: `app/(dashboard)/layout.tsx`

#### `(admin)` - Admin Panel
- Requires admin role
- Admin-only pages
- Layout: `app/(admin)/layout.tsx`

---

## Development Strategy

### 9 Development Phases

#### Phase 0: Bug Fixes & Cleanup (Week 1)
- Fix identified bugs
- Clean up code quality issues
- Resolve migration conflicts
- Set up development workflow

#### Phase 1: Authentication (Week 1-2)
- Install and configure Auth.js v5
- Create sign-up/sign-in pages
- Implement email verification
- Add password reset flow
- Protect routes with middleware

#### Phase 2: Shopping Cart (Week 2-3)
- Create Cart database models
- Set up Zustand store
- Build cart UI components
- Implement add/remove/update actions
- Cart persistence (localStorage + DB)

#### Phase 3: Checkout & Orders (Week 3-5)
- Create Order database models
- Integrate Stripe
- Build checkout flow (multi-step)
- Order confirmation emails
- Order history page

#### Phase 4: Admin Panel (Week 5-6)
- Create admin layout
- Dashboard with metrics
- Order management
- User management
- Low stock alerts

#### Phase 5: Product Management (Week 6-7)
- Product CRUD operations
- Image upload (UploadThing)
- Stock management
- Category management
- Bulk actions

#### Phase 6: Reviews & Ratings (Week 7-8)
- Review database model
- Review form on product page
- Display reviews
- Update product ratings
- Edit/delete reviews

#### Phase 7: Search & Filters (Week 8-9)
- Full-text search
- Category filters
- Price range filter
- Brand filters
- Sort options
- Pagination

#### Phase 8: User Profile (Week 9)
- Profile page
- Edit profile
- Address management
- Change password
- Delete account

#### Phase 9: Polish & Optimization (Week 10)
- Performance optimization
- SEO improvements
- Error boundaries
- Loading states
- Accessibility audit
- Final testing

### Timeline: ~10 weeks (2.5 months)

---

## State Management

### Global State (Zustand)

#### Cart Store
```typescript
// lib/store/cart-store.ts
interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}
```

**Persistence:**
- localStorage for guest users
- Database sync for authenticated users
- Merge on login

#### User Preferences Store (Optional)
```typescript
interface UserPreferencesState {
  theme: 'light' | 'dark' | 'system'
  currency: 'USD' | 'EUR'
  setTheme: (theme: string) => void
}
```

### Server State (Server Components)
- No client-side caching library needed
- Server Components fetch data directly
- Cache via Next.js `fetch()` cache options
- Revalidation via `revalidatePath()` and `revalidateTag()`

### Form State (React Hook Form)
- Local component state
- Validation via Zod
- Error handling built-in

---

## Authentication Strategy

### Auth.js v5 Configuration

#### File: `auth.ts`
```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/db/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        // Validate credentials
        // Return user or null
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.sub
      session.user.role = token.role
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    error: '/auth-error',
  },
})
```

#### Middleware: `middleware.ts`
```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'admin'

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Session Management
- **Strategy**: JWT (default)
- **Expiry**: 30 days
- **Refresh**: Automatic on activity
- **Storage**: HTTP-only cookies

### Password Hashing
- **Library**: bcrypt-ts-edge (already installed)
- **Rounds**: 10
- **Validation**: Zod schema (min 8 chars, 1 uppercase, 1 number)

---

## Payment Integration

### Stripe Setup

#### Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Server Action: Create Payment Intent
```typescript
// lib/actions/payment.actions.ts
'use server'

import Stripe from 'stripe'
import { auth } from '@/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createPaymentIntent(amount: number) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: 'usd',
    metadata: {
      userId: session.user.id,
    },
  })

  return { clientSecret: paymentIntent.client_secret }
}
```

#### Client Component: Stripe Elements
```typescript
// components/checkout/payment-form.tsx
'use client'

import { Elements, PaymentElement } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PaymentForm({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentElement />
      {/* Submit button */}
    </Elements>
  )
}
```

#### Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'payment_intent.succeeded') {
    // Update order status to 'paid'
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
```

### Payment Flow
1. User completes checkout form
2. Server Action creates payment intent
3. Client receives client secret
4. Stripe Elements mounted with secret
5. User enters card details
6. Stripe processes payment
7. Webhook confirms success
8. Order status updated
9. Confirmation email sent

---

## File Upload Strategy

### UploadThing Configuration

#### Core File: `lib/uploadthing.ts`
```typescript
import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      // Auth check
      const user = await auth()
      if (!user || user.role !== 'admin') throw new Error('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.url)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
```

#### Route Handler: `app/api/uploadthing/route.ts`
```typescript
import { createRouteHandler } from 'uploadthing/next'
import { ourFileRouter } from '@/lib/uploadthing'

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})
```

#### Client Component
```typescript
'use client'

import { UploadButton } from '@/lib/uploadthing'

export function ImageUpload({ onUpload }: { onUpload: (urls: string[]) => void }) {
  return (
    <UploadButton
      endpoint="productImage"
      onClientUploadComplete={(res) => {
        onUpload(res.map((file) => file.url))
      }}
    />
  )
}
```

---

## Database Migration Plan

### Phase 0: Fix Existing Migration
```bash
# Check migration status
npx prisma migrate status

# If needed, reset and reapply
npx prisma migrate reset
npx prisma migrate deploy
```

### Phase 1: Cart Models
```bash
npx prisma migrate dev --name add_cart_models
```

### Phase 2: Order Models
```bash
npx prisma migrate dev --name add_order_models
```

### Phase 3: Review Model
```bash
npx prisma migrate dev --name add_review_model
```

### Migration Best Practices
- One migration per phase
- Test migrations locally first
- Always create backup before production migration
- Use `prisma migrate diff` to review changes
- Update seed data after migrations

---

## Testing Strategy

### 🔴 MANDATORY Test-First Approach

**Philosophy:** Tests are not an afterthought - they drive development.

**Rule:** No code is written without a test. No task is marked complete without passing tests.

---

### Test-First Development Workflow

#### Phase 0: Test Infrastructure Setup (TASK-000)
**Before any feature development, set up testing:**

```bash
# Install Jest and React Testing Library
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest

# Configure Jest
# Create jest.config.js
# Create jest.setup.js
# Add test scripts to package.json
```

**Coverage Thresholds (Enforced):**
```javascript
// jest.config.js
coverageThresholds: {
  global: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
  },
}
```

---

### Testing Pyramid

#### 1. Unit Tests (Jest) - 100% Coverage for Utilities
**What to test:**
- Pure functions in `lib/utils.ts`
- Zod validation schemas
- Helper functions
- Type transformations

**When to write:** BEFORE implementation (TDD)

**Example Flow:**
```typescript
// Step 1: Write failing test
// __tests__/lib/utils.test.ts
import { formatPrice } from '@/lib/utils'

describe('formatPrice', () => {
  it('should format price with dollar sign', () => {
    expect(formatPrice(29.99)).toBe('$29.99')
  })
})

// Step 2: Run test (fails - function doesn't exist)
npm test

// Step 3: Implement function
// lib/utils.ts
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`
}

// Step 4: Run test (passes)
npm test

// Step 5: Refactor if needed (keep tests green)
```

**Required Tests per Utility:**
- Happy path (valid input)
- Edge cases (0, negative, very large)
- Error cases (invalid input)
- Boundary conditions

---

#### 2. Integration Tests (Jest) - 90% Coverage for Server Actions
**What to test:**
- Server Actions
- Database operations (with mocked Prisma)
- API routes (webhooks)
- Data transformations

**When to write:** BEFORE implementation (TDD)

**Mocking Strategy:**
```typescript
// __tests__/lib/actions/product.actions.test.ts
import { getProductBySlug } from '@/lib/actions/product.actions'
import { prisma } from '@/db/prisma'

// Mock Prisma
jest.mock('@/db/prisma', () => ({
  prisma: {
    product: {
      findFirst: jest.fn(),
    },
  },
}))

describe('Product Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return product by slug', async () => {
    const mockProduct = {
      id: '1',
      slug: 'test-product',
      name: 'Test Product',
      price: '29.99',
    }

    (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct)

    const result = await getProductBySlug('test-product')

    expect(result).toEqual(mockProduct)
    expect(prisma.product.findFirst).toHaveBeenCalledWith({
      where: { slug: 'test-product' },
    })
  })

  it('should return null for non-existent product', async () => {
    (prisma.product.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await getProductBySlug('invalid')

    expect(result).toBeNull()
  })

  it('should handle database errors', async () => {
    (prisma.product.findFirst as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    await expect(getProductBySlug('test')).rejects.toThrow()
  })
})
```

**Required Tests per Server Action:**
- Successful operation (happy path)
- Not found scenarios
- Validation failures
- Authorization checks
- Database errors

---

#### 3. Component Tests (RTL) - 70% Coverage
**What to test:**
- Component rendering
- User interactions
- Props handling
- Conditional rendering
- Accessibility

**When to write:** BEFORE or DURING implementation

**Testing Library Principles:**
- Test user behavior, not implementation
- Query by accessibility roles
- Use userEvent for interactions

**Example:**
```typescript
// __tests__/components/shared/product/product-card.test.tsx
import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/shared/product/product-card'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    slug: 'test-product',
    name: 'Test Product',
    price: '29.99',
    rating: '4.5',
    stock: 10,
    images: ['/test.jpg'],
    brand: 'Test Brand',
  }

  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Test Brand')).toBeInTheDocument()
    expect(screen.getByText('4.5 Stars')).toBeInTheDocument()
  })

  it('should show out of stock when stock is 0', () => {
    const outOfStock = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStock} />)

    expect(screen.getByText('Out Of Stock')).toBeInTheDocument()
  })

  it('should have accessible link to product', () => {
    render(<ProductCard product={mockProduct} />)

    const link = screen.getByRole('link', { name: /test product/i })
    expect(link).toHaveAttribute('href', '/product/test-product')
  })
})
```

---

#### 4. E2E Tests (Playwright) - Phase 9 Only
**What to test:**
- Complete user flows
- Critical paths (checkout, authentication)
- Cross-browser compatibility

**When to write:** Phase 9 (Polish phase)

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Example:**
```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('user can complete purchase', async ({ page }) => {
    // Sign in
    await page.goto('/sign-in')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Password123')
    await page.click('button[type="submit"]')

    // Add to cart
    await page.goto('/product/polo-shirt')
    await page.click('button:has-text("Add to Cart")')
    await expect(page.locator('[data-cart-count]')).toHaveText('1')

    // Checkout
    await page.click('a:has-text("Cart")')
    await page.click('button:has-text("Checkout")')

    // Fill address
    await page.fill('input[name="street"]', '123 Main St')
    await page.fill('input[name="city"]', 'San Francisco')
    await page.fill('input[name="zip"]', '94102')
    await page.click('button:has-text("Continue")')

    // Payment (test mode)
    await page.fill('input[name="cardNumber"]', '4242424242424242')
    await page.fill('input[name="expiry"]', '12/25')
    await page.fill('input[name="cvc"]', '123')
    await page.click('button:has-text("Place Order")')

    // Confirmation
    await expect(page).toHaveURL(/\/checkout\/success/)
    await expect(page.locator('h1')).toContainText('Order Confirmed')
  })
})
```

---

### Coverage Requirements by Type

| Code Type | Coverage | Mandatory |
|-----------|----------|-----------|
| Utilities/Helpers | 100% | ✅ Yes |
| Zod Schemas | 100% | ✅ Yes |
| Server Actions | 90% | ✅ Yes |
| Components | 70% | ✅ Yes |
| E2E Flows | Critical paths | Phase 9 |

---

### Test Execution Rules

#### Before Marking Task Complete:
```bash
# 1. Run all tests
npm test
# ✅ Must pass - No exceptions

# 2. Check coverage
npm test:coverage
# ✅ Must meet threshold - No exceptions

# 3. Type check
npx tsc --noEmit
# ✅ Must pass - No exceptions

# 4. Lint
npm run lint
# ✅ Must pass - No exceptions

# 5. Build
npm run build
# ✅ Must compile - No exceptions
```

**If ANY step fails, task is NOT complete.**

---

### CI/CD Integration (Future)

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test:coverage
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run build
```

**PR Merge Criteria:**
- ✅ All tests passing
- ✅ Coverage maintained
- ✅ No type errors
- ✅ No lint errors
- ✅ Build succeeds

---

### Test Folder Structure

```
proshopp/
├── __tests__/
│   ├── setup.ts
│   ├── lib/
│   │   ├── utils.test.ts
│   │   ├── validations/
│   │   │   ├── auth.test.ts
│   │   │   ├── product.test.ts
│   │   │   └── cart.test.ts
│   │   └── actions/
│   │       ├── product.actions.test.ts
│   │       ├── cart.actions.test.ts
│   │       └── order.actions.test.ts
│   └── components/
│       ├── shared/
│       │   ├── product/
│       │   │   ├── product-card.test.tsx
│       │   │   └── product-list.test.tsx
│       │   └── cart/
│       │       └── cart-item.test.tsx
│       └── ui/
│           └── button.test.tsx
├── e2e/
│   ├── checkout.spec.ts
│   └── auth.spec.ts
├── jest.config.js
└── jest.setup.js
```

---

### Testing Best Practices

1. **Write Tests First (TDD)**
   - Red → Green → Refactor
   - Tests define the contract

2. **Test Behavior, Not Implementation**
   - Focus on what, not how
   - Don't test internal state

3. **Use Descriptive Test Names**
   - `it('should add item to cart when stock is available')`
   - Not: `it('works')`

4. **Arrange, Act, Assert (AAA)**
   ```typescript
   it('should format price correctly', () => {
     // Arrange
     const price = 29.99

     // Act
     const result = formatPrice(price)

     // Assert
     expect(result).toBe('$29.99')
   })
   ```

5. **Test One Thing Per Test**
   - Each test should verify one behavior
   - Makes failures easier to diagnose

6. **Use Test Data Builders**
   ```typescript
   // __tests__/helpers/builders.ts
   export const buildProduct = (overrides = {}) => ({
     id: '1',
     slug: 'test-product',
     name: 'Test Product',
     price: '29.99',
     stock: 10,
     ...overrides,
   })
   ```

7. **Clean Up After Tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks()
   })

   afterEach(() => {
     jest.resetAllMocks()
   })
   ```

---

### Common Test Commands

```bash
# Run all tests
npm test

# Watch mode (during development)
npm test:watch

# Coverage report
npm test:coverage

# Run specific file
npm test product.actions.test.ts

# Run tests matching pattern
npm test cart

# Update snapshots
npm test -- -u

# Verbose output
npm test -- --verbose

# Only failed tests
npm test -- --onlyFailures
```

---

## Deployment Strategy

### Platform: **Vercel** (Recommended)
- Native Next.js support
- Automatic previews for PRs
- Edge functions
- Analytics built-in

### Database: **Neon** (Already configured)
- Serverless PostgreSQL
- Auto-scaling
- Branching for preview deployments

### Environment Setup

#### Development
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=dev-secret
NEXTAUTH_URL=http://localhost:3000
```

#### Production
```env
DATABASE_URL=postgresql://...  # Production DB
NEXTAUTH_SECRET=prod-secret-generated
NEXTAUTH_URL=https://proshopp.vercel.app
STRIPE_SECRET_KEY=sk_live_...
```

### Deployment Checklist
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Stripe webhook configured
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics configured
- [ ] Domain configured
- [ ] SSL certificate active

### CI/CD Pipeline
1. Push to `main` branch
2. Vercel auto-deploys
3. Run build checks
4. Run tests (future)
5. Deploy to production
6. Send Slack notification (future)

---

## Development Workflow

### Git Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

### Commit Convention
```
feat: Add shopping cart functionality
fix: Resolve price formatting bug
docs: Update README with setup instructions
refactor: Simplify cart store logic
test: Add tests for cart actions
```

### Code Review Process
1. Create feature branch
2. Make changes
3. Write tests
4. Create PR
5. Review (if team exists)
6. Merge to develop
7. Deploy to staging
8. Merge to main

### Development Commands
```bash
# Development
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npx prettier --write .

# Database
npx prisma studio
npx prisma migrate dev

# Build
npm run build
npm start
```

---

## Security Checklist

### Application Security
- [ ] Environment variables not committed
- [ ] HTTPS only in production
- [ ] Rate limiting on auth endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React escaping)
- [ ] CSRF tokens
- [ ] Input validation (Zod)
- [ ] Password hashing (bcrypt)
- [ ] Session security (HTTP-only cookies)

### API Security
- [ ] Authentication on protected routes
- [ ] Authorization checks (role-based)
- [ ] Webhook signature verification
- [ ] API rate limiting
- [ ] Request validation

### Data Security
- [ ] User data encrypted at rest
- [ ] PCI compliance (Stripe handles cards)
- [ ] GDPR compliance (data export/delete)
- [ ] Audit logs for admin actions

---

## Performance Optimization

### Initial Optimization (Already Done)
✅ Next.js Image optimization
✅ Server Components (default)
✅ Code splitting per route

### Phase 9 Optimizations
- [ ] Database query optimization (indexes)
- [ ] Image lazy loading
- [ ] Route preloading
- [ ] Edge caching (Vercel)
- [ ] Bundle size analysis
- [ ] Lighthouse score > 90

### Caching Strategy
- **Static pages**: ISR (1 hour)
- **Product pages**: ISR (5 minutes)
- **User pages**: No cache
- **Admin pages**: No cache

---

## Monitoring & Analytics

### Performance Monitoring
- **Vercel Analytics**: Core Web Vitals
- **Lighthouse CI**: Automated performance checks

### Error Tracking (Future)
- **Sentry**: Error monitoring and alerting

### Business Analytics (Future)
- **Google Analytics 4**: User behavior
- **Vercel Analytics**: Traffic and performance

---

## Risk Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Database migration fails | High | Test locally first, backup before migration |
| Stripe webhook failures | High | Retry logic, manual order verification |
| Session conflicts | Medium | Proper session management, testing |
| File upload failures | Low | Graceful error handling, retry |

### Business Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Cart abandonment | Medium | Email reminders (future) |
| Payment fraud | High | Stripe Radar enabled |
| Inventory overselling | Medium | Stock validation before payment |

---

## Future Enhancements (Post-MVP)

### Phase 10+ (Nice to Have)
- Wishlist/favorites
- Product recommendations
- Discount codes/coupons
- Gift cards
- Subscription products
- Multi-currency support
- International shipping
- Advanced analytics dashboard
- Customer support chat
- Mobile app (React Native)

---

## Success Metrics

### Development Metrics
- **Phase completion**: On schedule (10 weeks)
- **Code quality**: Lint/type errors = 0
- **Test coverage**: > 70%
- **Build time**: < 60 seconds

### Product Metrics (Post-Launch)
- **Performance**: Lighthouse > 90
- **Uptime**: > 99.5%
- **Load time**: < 2 seconds
- **Conversion**: > 2%

---

## Appendix

### Useful Commands Cheat Sheet
```bash
# Database
npx prisma studio                    # Open database GUI
npx prisma migrate dev              # Create and apply migration
npx prisma migrate reset            # Reset database
npx prisma db push                  # Push schema without migration
npx tsx db/seed.ts                  # Seed database

# Development
npm run dev                         # Start dev server
npm run build                       # Build for production
npm run lint                        # Run ESLint
npx tsc --noEmit                   # Type check

# Auth.js
npx auth secret                     # Generate secret

# Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Deployment
vercel                             # Deploy to Vercel
vercel --prod                      # Deploy to production
```

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Auth.js Docs](https://authjs.dev)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Stripe Docs](https://stripe.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
