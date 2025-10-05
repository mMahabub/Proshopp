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
```

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

### Current Completion: 18%
The project is in early development stage. Core documentation exists to guide development:
- **spec.md** - Feature specifications and requirements
- **plan.md** - Architecture decisions and implementation strategy
- **task.md** - Detailed task breakdown (54 tasks across 9 phases)

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

#### Authentication (Auth.js v5)
- **Installation**: `npm install next-auth@beta @auth/prisma-adapter`
- **Config File**: `auth.ts` (root)
- **Providers**: Credentials, Google, GitHub
- **Session Strategy**: JWT with 30-day expiry
- **Middleware**: `middleware.ts` for route protection
- **Routes**:
  - Public: `/sign-in`, `/sign-up`, `/verify-email`, `/reset-password`
  - Protected: `/dashboard/*`, `/checkout/*`
  - Admin: `/admin/*`

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

#### Email (Resend)
- **Installation**: `npm install resend react-email`
- **Templates**: `emails/*.tsx` (React Email components)
- **Use Cases**: Welcome, verification, password reset, order confirmation

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

New directories to be added:
```
app/(auth)/              # Auth pages (sign-in, sign-up, etc.)
app/(dashboard)/         # User dashboard (profile, orders, addresses)
app/(admin)/            # Admin panel (dashboard, products, orders, users)
app/api/uploadthing/    # File upload route
app/api/webhooks/       # Stripe webhooks
lib/store/              # Zustand stores
lib/validations/        # Zod schemas (auth, product, order, review)
lib/hooks/              # Custom React hooks
emails/                 # React Email templates
types/                  # Additional TypeScript types (auth, cart, order)
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

#### Client Components with Server Actions
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

# E2E Testing (Phase 9)
npm run test:e2e                   # Run E2E tests
npx playwright test                # Run Playwright tests
npx lighthouse http://localhost:3000  # Performance audit
```

### Resources

- [Project Specification](spec.md) - Feature requirements
- [Implementation Plan](plan.md) - Architecture decisions
- [Task Breakdown](task.md) - Detailed task list
- [Next.js Docs](https://nextjs.org/docs)
- [Auth.js Docs](https://authjs.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
