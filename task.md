# Proshopp - Task Breakdown

**Version:** 1.1 (Test-First Update)
**Last Updated:** October 4, 2025
**Total Tasks:** 54 (includes TASK-000 for test setup)
**Estimated Duration:** 10 weeks
**Testing:** 🔴 MANDATORY - All tests must pass before marking tasks complete

---

## Progress Tracker

| Phase | Tasks | Status | Completion |
|-------|-------|--------|------------|
| Phase 0: Test Setup & Bug Fixes | 7 | 🟡 In Progress | 57% (4/7) |
| Phase 1: Authentication | 8 | 🔴 Not Started | 0% |
| Phase 2: Shopping Cart | 7 | 🔴 Not Started | 0% |
| Phase 3: Checkout & Orders | 9 | 🔴 Not Started | 0% |
| Phase 4: Admin Panel | 8 | 🔴 Not Started | 0% |
| Phase 5: Product Management | 6 | 🔴 Not Started | 0% |
| Phase 6: Reviews & Ratings | 5 | 🔴 Not Started | 0% |
| Phase 7: Search & Filters | 5 | 🔴 Not Started | 0% |
| Phase 8: User Profile | 4 | 🔴 Not Started | 0% |
| Phase 9: Polish & SEO | 5 | 🔴 Not Started | 0% |

**Overall Progress: 25% → Target: 100%**

**Completed Tasks:**
- ✅ TASK-000: Test infrastructure setup (Jest + RTL)
- ✅ TASK-001: Fix formatNumberWithDecimal utility
- ✅ TASK-002: Fix product rating display (remove $ from rating)
- ✅ TASK-003: Fix not-found page grammar
- ✅ TASK-004: Fix mode-toggle import (use local UI component)

---

## Task Convention

Each task follows this format with **MANDATORY TESTING**:
```
### [TASK-ID] Task Name
**Complexity:** Low | Medium | High
**Priority:** P0 | P1 | P2
**Dependencies:** [TASK-IDs or "None"]
**Estimated Time:** X hours (includes test writing)

**Description:**
What needs to be done

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Files to Create/Modify:**
- path/to/file.ts

**Tests Required:** 🔴 MANDATORY
**Test Files to Create:**
- __tests__/path/to/file.test.ts

**Test Cases:**
1. Test case description
2. Test case description

**Test Command:**
npm test __tests__/path/to/file.test.ts

**Definition of Done:** ⚠️ ALL must be checked before marking complete
- [ ] Implementation complete
- [ ] Tests written and passing
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Manual verification complete
- [ ] Code reviewed (self-review minimum)
```

## Testing Philosophy

**🔴 RED-GREEN-REFACTOR APPROACH:**
1. **Write Test First** (if applicable) - Test fails (RED)
2. **Implement Code** - Make test pass (GREEN)
3. **Refactor** - Clean up while keeping tests green
4. **Manual Test** - Verify in browser/app
5. **Mark Complete** - Only when ALL tests pass

**Test Coverage Requirements:**
- **Utilities/Helpers**: 100% coverage (pure functions)
- **Server Actions**: 90% coverage (business logic)
- **Components**: 70% coverage (critical paths)
- **Integration**: Critical user flows only

**Test Types Per Task:**
- **Unit Tests**: Functions, utilities, validation schemas
- **Integration Tests**: Server actions, database operations
- **Component Tests**: User interactions, rendering
- **E2E Tests**: Critical flows (checkout, auth) - Phase 9

---

## Phase 0: Bug Fixes & Cleanup
**Duration:** Week 1 (Days 1-3)
**Goal:** Set up testing infrastructure, fix existing bugs, and prepare codebase for feature development

---

### [TASK-000] Set up testing infrastructure
**Complexity:** Medium
**Priority:** P0
**Dependencies:** None
**Estimated Time:** 2 hours

**Description:**
Set up Jest and React Testing Library for unit and integration testing. This is the foundation for all future tests.

**Acceptance Criteria:**
- [ ] Jest installed and configured
- [ ] React Testing Library installed
- [ ] TypeScript support configured
- [ ] Test script added to package.json
- [ ] Sample test passes
- [ ] Coverage reporting configured
- [ ] Test folder structure created

**Files to Create:**
- `jest.config.js`
- `jest.setup.js`
- `__tests__/setup.ts`
- `__tests__/lib/utils.test.ts` (sample)

**Installation Commands:**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest
```

**Configuration:**
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Tests Required:** 🔴 MANDATORY
**Test Files to Create:**
- `__tests__/lib/utils.test.ts` (sample test)

**Test Cases:**
1. Test that Jest is configured correctly
2. Test cn() utility function works
3. Test convertToPlainObject() works

**Sample Test:**
```typescript
// __tests__/lib/utils.test.ts
import { cn, convertToPlainObject } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', false && 'hidden', 'show')).toBe('base show')
    })
  })

  describe('convertToPlainObject', () => {
    it('should convert object to plain object', () => {
      const input = { name: 'Test', value: 123 }
      const result = convertToPlainObject(input)
      expect(result).toEqual(input)
    })

    it('should handle nested objects', () => {
      const input = { user: { name: 'John', age: 30 } }
      const result = convertToPlainObject(input)
      expect(result).toEqual(input)
    })
  })
})
```

**Test Command:**
```bash
npm test
```

**Definition of Done:** ⚠️ ALL must be checked before marking complete
- [ ] Jest and RTL installed
- [ ] Configuration files created
- [ ] Sample tests written
- [ ] `npm test` runs successfully
- [ ] All sample tests pass
- [ ] Coverage report generates
- [ ] No installation errors
- [ ] Documentation updated in package.json

---

### [TASK-001] Fix formatNumberWithDecimal utility
**Complexity:** Low
**Priority:** P0
**Dependencies:** [TASK-000]
**Estimated Time:** 1 hour (0.5h code + 0.5h tests)

**Description:**
Fix bug in `formatNumberWithDecimal` function that uses comma instead of dot for decimal split.

**Acceptance Criteria:**
- [ ] Function splits on dot (.) not comma (,)
- [ ] Handles integers correctly
- [ ] Handles decimals correctly
- [ ] Handles edge cases (0, negative numbers)

**Files to Modify:**
- `lib/utils.ts` (line 19)

**Tests Required:** 🔴 MANDATORY
**Test Files to Create:**
- `__tests__/lib/utils.test.ts` (add to existing file from TASK-000)

**Test Cases:**
1. Should format integer as "XX.00"
2. Should format single decimal as "XX.X0"
3. Should format two decimals as "XX.XX"
4. Should handle zero correctly
5. Should handle large numbers
6. Should handle very small decimals

**Test Implementation:**
```typescript
// __tests__/lib/utils.test.ts
describe('formatNumberWithDecimal', () => {
  it('should format integer with two decimal places', () => {
    expect(formatNumberWithDecimal(10)).toBe('10.00')
  })

  it('should format single decimal place', () => {
    expect(formatNumberWithDecimal(10.5)).toBe('10.50')
  })

  it('should format two decimal places', () => {
    expect(formatNumberWithDecimal(99.99)).toBe('99.99')
  })

  it('should handle zero', () => {
    expect(formatNumberWithDecimal(0)).toBe('0.00')
  })

  it('should handle large numbers', () => {
    expect(formatNumberWithDecimal(1234567.89)).toBe('1234567.89')
  })

  it('should handle very small decimals', () => {
    expect(formatNumberWithDecimal(0.01)).toBe('0.01')
  })
})
```

**Test Command:**
```bash
npm test __tests__/lib/utils.test.ts
```

**Manual Testing:**
- Navigate to product page
- Verify prices display correctly
- Check cart totals

**Definition of Done:** ⚠️ ALL must be checked before marking complete
- [ ] Bug fixed in utils.ts
- [ ] All 6 test cases written
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Manual verification on product page
- [ ] Code reviewed

---

### [TASK-002] Fix product rating display
**Complexity:** Low
**Priority:** P0
**Dependencies:** None
**Estimated Time:** 0.5 hours

**Description:**
Remove dollar sign from rating display in ProductCard component.

**Acceptance Criteria:**
- [ ] Rating shows as "4.5 Stars" not "$4.5 Stars"
- [ ] Verify on all product cards

**Files to Modify:**
- `components/shared/product/product-card.tsx` (line 36)

**Testing:**
- Navigate to homepage
- Verify rating display format

---

### [TASK-003] Fix not-found page grammar
**Complexity:** Low
**Priority:** P2
**Dependencies:** None
**Estimated Time:** 0.25 hours

**Description:**
Fix grammar error in not-found page message.

**Acceptance Criteria:**
- [ ] Message reads "Could not find requested page"
- [ ] Proper capitalization and punctuation

**Files to Modify:**
- `app/not-found.tsx` (line 16)

**Testing:**
- Navigate to /invalid-route
- Verify error message

---

### [TASK-004] Fix mode-toggle import
**Complexity:** Low
**Priority:** P1
**Dependencies:** None
**Estimated Time:** 0.5 hours

**Description:**
Fix import to use local UI component instead of direct Radix import.

**Acceptance Criteria:**
- [ ] Import from "@/components/ui/dropdown-menu"
- [ ] Theme toggle still works
- [ ] No TypeScript errors

**Files to Modify:**
- `components/shared/header/mode-toggle.tsx` (line 4)

**Testing:**
- Click theme toggle
- Verify dropdown opens
- Verify theme changes work

---

### [TASK-005] Resolve database migration conflict
**Complexity:** Medium
**Priority:** P0
**Dependencies:** None
**Estimated Time:** 1 hour

**Description:**
Check and resolve uncommitted migration `20250421030636_add_user_based_t/`

**Acceptance Criteria:**
- [ ] Migration status is clean
- [ ] No pending migrations
- [ ] Database schema matches Prisma schema
- [ ] Migration committed to git

**Files to Check:**
- `prisma/migrations/`
- `prisma/schema.prisma`

**Testing:**
```bash
npx prisma migrate status
npx prisma validate
```

---

### [TASK-006] Set up development environment documentation
**Complexity:** Low
**Priority:** P1
**Dependencies:** None
**Estimated Time:** 1 hour

**Description:**
Create .env.example file with all required environment variables.

**Acceptance Criteria:**
- [ ] File includes all current env vars
- [ ] File includes future env vars (Auth.js, Stripe, etc.)
- [ ] Instructions for obtaining API keys
- [ ] Add to .gitignore check

**Files to Create:**
- `.env.example`

**Testing:**
- Clone repo fresh
- Copy .env.example to .env
- Fill in values
- App runs successfully

---

## Phase 1: Authentication
**Duration:** Week 1-2 (Days 4-10)
**Goal:** Implement complete authentication system with Auth.js v5

---

### [TASK-101] Install Auth.js v5 and dependencies
**Complexity:** Low
**Priority:** P0
**Dependencies:** [TASK-006]
**Estimated Time:** 1 hour

**Description:**
Install Auth.js v5 (beta), Prisma adapter, and OAuth providers.

**Acceptance Criteria:**
- [ ] next-auth@beta installed
- [ ] @auth/prisma-adapter installed
- [ ] No dependency conflicts
- [ ] Generate auth secret

**Commands:**
```bash
npm install next-auth@beta @auth/prisma-adapter
npx auth secret
```

**Testing:**
- `npm run dev` runs without errors

---

### [TASK-102] Configure Auth.js with Prisma adapter
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-101]
**Estimated Time:** 2 hours

**Description:**
Create auth.ts configuration file with Prisma adapter and providers.

**Acceptance Criteria:**
- [ ] auth.ts exports handlers, auth, signIn, signOut
- [ ] Prisma adapter configured
- [ ] Credentials provider set up
- [ ] Google OAuth configured
- [ ] GitHub OAuth configured
- [ ] JWT callbacks for role

**Files to Create:**
- `auth.ts` (root)
- `auth.config.ts` (optional)

**Testing:**
- No TypeScript errors
- Auth exports work

---

### [TASK-103] Create authentication middleware
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-102]
**Estimated Time:** 1.5 hours

**Description:**
Create middleware to protect routes based on authentication and role.

**Acceptance Criteria:**
- [ ] Middleware protects /dashboard routes
- [ ] Middleware protects /admin routes (admin only)
- [ ] Redirects to /sign-in when unauthorized
- [ ] Public routes remain accessible

**Files to Create:**
- `middleware.ts` (root)

**Testing:**
- Access /dashboard when logged out → redirect to /sign-in
- Access /admin as user → redirect to /
- Access / when logged out → works

---

### [TASK-104] Create sign-up page and form
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-102]
**Estimated Time:** 3 hours

**Description:**
Create sign-up page with email/password form and OAuth buttons.

**Acceptance Criteria:**
- [ ] Form with name, email, password fields
- [ ] Password strength indicator
- [ ] Form validation (Zod)
- [ ] Google sign-up button
- [ ] GitHub sign-up button
- [ ] Link to sign-in page
- [ ] Error handling and display

**Files to Create:**
- `app/(auth)/sign-up/page.tsx`
- `app/(auth)/layout.tsx` (clean layout)
- `components/auth/sign-up-form.tsx`
- `lib/validations/auth.ts`
- `lib/actions/auth.actions.ts`

**Zod Schema:**
```typescript
signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})
```

**Testing:**
- Submit form with valid data → success
- Submit with invalid email → error
- Submit with weak password → error
- Click Google button → OAuth flow
- Click GitHub button → OAuth flow

---

### [TASK-105] Create sign-in page and form
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-104]
**Estimated Time:** 2 hours

**Description:**
Create sign-in page with email/password form and OAuth buttons.

**Acceptance Criteria:**
- [ ] Form with email, password fields
- [ ] "Remember me" checkbox
- [ ] Form validation
- [ ] Google sign-in button
- [ ] GitHub sign-in button
- [ ] Link to sign-up page
- [ ] Link to forgot password
- [ ] Error handling

**Files to Create:**
- `app/(auth)/sign-in/page.tsx`
- `components/auth/sign-in-form.tsx`

**Testing:**
- Sign in with valid credentials → redirect to dashboard
- Sign in with invalid credentials → error message
- Click OAuth button → OAuth flow
- "Remember me" extends session

---

### [TASK-106] Implement email verification
**Complexity:** High
**Priority:** P1
**Dependencies:** [TASK-104]
**Estimated Time:** 4 hours

**Description:**
Send verification email on sign-up and verify token.

**Acceptance Criteria:**
- [ ] Verification token generated on sign-up
- [ ] Email sent with verification link
- [ ] Verify page validates token
- [ ] User can't sign in until verified
- [ ] Resend verification email option
- [ ] Token expires after 24 hours

**Files to Create:**
- `app/(auth)/verify-email/page.tsx`
- `lib/utils/email.ts`
- `emails/verification-email.tsx` (React Email)

**Dependencies:**
```bash
npm install resend react-email
```

**Testing:**
- Sign up → check email inbox
- Click link → verify success
- Try to sign in before verify → error
- Token expires → error message

---

### [TASK-107] Implement password reset flow
**Complexity:** High
**Priority:** P1
**Dependencies:** [TASK-105, TASK-106]
**Estimated Time:** 4 hours

**Description:**
Create password reset request and reset pages with email flow.

**Acceptance Criteria:**
- [ ] Forgot password page with email input
- [ ] Reset token generated and emailed
- [ ] Reset password page with token validation
- [ ] New password form with confirmation
- [ ] Token expires after 1 hour
- [ ] Can't reuse old tokens

**Files to Create:**
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `components/auth/forgot-password-form.tsx`
- `components/auth/reset-password-form.tsx`
- `emails/reset-password-email.tsx`

**Testing:**
- Request reset → receive email
- Click link → reset form loads
- Submit new password → success
- Try old token → error
- Try expired token → error

---

### [TASK-108] Update header with auth state
**Complexity:** Low
**Priority:** P0
**Dependencies:** [TASK-105]
**Estimated Time:** 2 hours

**Description:**
Update header menu to show user state (signed in/out).

**Acceptance Criteria:**
- [ ] Show "Sign In" when logged out
- [ ] Show user avatar/name when logged in
- [ ] Dropdown with "Profile", "Orders", "Sign Out"
- [ ] Admin sees "Admin Panel" link
- [ ] Mobile menu includes auth state

**Files to Modify:**
- `components/shared/header/menu.tsx`

**Testing:**
- Logged out → see "Sign In"
- Logged in as user → see profile dropdown
- Logged in as admin → see "Admin Panel" link
- Click "Sign Out" → logged out

---

## Phase 2: Shopping Cart
**Duration:** Week 2-3 (Days 8-17)
**Goal:** Implement shopping cart with Zustand and database persistence

---

### [TASK-201] Create Cart database models
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-005]
**Estimated Time:** 1.5 hours

**Description:**
Add Cart and CartItem models to Prisma schema.

**Acceptance Criteria:**
- [ ] Cart model with userId relation
- [ ] CartItem model with Cart and Product relations
- [ ] Unique constraint on cartId + productId
- [ ] Migration created and applied
- [ ] Prisma client regenerated

**Files to Modify:**
- `prisma/schema.prisma`

**Commands:**
```bash
npx prisma migrate dev --name add_cart_models
npx prisma generate
```

**Testing:**
```bash
npx prisma studio
# Verify Cart and CartItem tables exist
```

---

### [TASK-202] Set up Zustand cart store
**Complexity:** Medium
**Priority:** P0
**Dependencies:** None
**Estimated Time:** 2 hours

**Description:**
Create Zustand store for cart state with localStorage persistence.

**Acceptance Criteria:**
- [ ] Store includes items array
- [ ] Actions: addItem, removeItem, updateQuantity, clearCart
- [ ] Getters: getTotal, getItemCount
- [ ] Persist to localStorage
- [ ] TypeScript types defined

**Dependencies:**
```bash
npm install zustand
```

**Files to Create:**
- `lib/store/cart-store.ts`
- `types/cart.ts`

**Testing:**
```typescript
// In browser console
useCartStore.getState().addItem({ id: '1', name: 'Test', price: 10 }, 2)
useCartStore.getState().getItemCount() // 2
```

---

### [TASK-203] Create cart server actions
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-201]
**Estimated Time:** 2.5 hours

**Description:**
Create server actions for cart database operations.

**Acceptance Criteria:**
- [ ] getCart() - fetch user's cart
- [ ] syncCart(items) - sync local cart to DB
- [ ] addToCart(productId, quantity)
- [ ] updateCartItem(itemId, quantity)
- [ ] removeFromCart(itemId)
- [ ] clearCart()
- [ ] Stock validation before add
- [ ] Error handling

**Files to Create:**
- `lib/actions/cart.actions.ts`
- `lib/validations/cart.ts`

**Testing:**
- Call actions via server component
- Verify database updates
- Test stock validation

---

### [TASK-204] Add "Add to Cart" functionality
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-202, TASK-203]
**Estimated Time:** 2 hours

**Description:**
Wire up "Add to Cart" button on product detail page.

**Acceptance Criteria:**
- [ ] Button calls cart store addItem
- [ ] Button disabled when out of stock
- [ ] Shows quantity selector (1-10)
- [ ] Success toast notification
- [ ] Optimistic UI update
- [ ] Syncs to DB if authenticated
- [ ] Stock validated before add

**Files to Modify:**
- `app/(root)/product/[slug]/page.tsx`

**Files to Create:**
- `components/shared/product/add-to-cart-button.tsx`

**Testing:**
- Click "Add to Cart" → success toast
- Check cart icon badge → count increases
- Add when out of stock → disabled
- Add more than available stock → error

---

### [TASK-205] Create cart page
**Complexity:** High
**Priority:** P0
**Dependencies:** [TASK-202, TASK-203]
**Estimated Time:** 4 hours

**Description:**
Create cart page showing all items with update/remove functionality.

**Acceptance Criteria:**
- [ ] Display all cart items in table/list
- [ ] Show product image, name, price, quantity
- [ ] Quantity selector for each item
- [ ] Remove item button with confirmation
- [ ] Display subtotal, tax, total
- [ ] "Continue Shopping" button
- [ ] "Proceed to Checkout" button
- [ ] Empty cart state with CTA
- [ ] Responsive design

**Files to Create:**
- `app/(root)/cart/page.tsx`
- `components/shared/cart/cart-item.tsx`
- `components/shared/cart/cart-summary.tsx`

**Testing:**
- Add items → navigate to /cart
- Update quantity → total updates
- Remove item → confirmation modal
- Empty cart → see empty state

---

### [TASK-206] Add cart icon with badge to header
**Complexity:** Low
**Priority:** P0
**Dependencies:** [TASK-202]
**Estimated Time:** 1.5 hours

**Description:**
Add cart icon to header with item count badge.

**Acceptance Criteria:**
- [ ] Cart icon in header (ShoppingCart from lucide)
- [ ] Badge shows item count
- [ ] Badge hidden when cart empty
- [ ] Links to /cart page
- [ ] Updates in real-time

**Files to Modify:**
- `components/shared/header/menu.tsx`

**Testing:**
- Add item → badge appears with count
- Add another → count increases
- Remove all → badge disappears

---

### [TASK-207] Implement cart merge on login
**Complexity:** High
**Priority:** P1
**Dependencies:** [TASK-108, TASK-203]
**Estimated Time:** 3 hours

**Description:**
Merge guest cart (localStorage) with user cart (DB) on login.

**Acceptance Criteria:**
- [ ] On login, fetch user's DB cart
- [ ] Merge with localStorage cart
- [ ] Handle duplicate items (sum quantities)
- [ ] Clear localStorage after merge
- [ ] Sync merged cart to DB
- [ ] Handle stock conflicts

**Files to Modify:**
- `lib/actions/auth.actions.ts` (signIn callback)
- `lib/store/cart-store.ts`

**Testing:**
- Add items as guest
- Sign in
- Verify cart contains all items
- Verify localStorage cleared
- Verify DB updated

---

## Phase 3: Checkout & Orders
**Duration:** Week 3-5 (Days 15-35)
**Goal:** Implement complete checkout flow with Stripe integration

---

### [TASK-301] Create Order database models
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-201]
**Estimated Time:** 1.5 hours

**Description:**
Add Order and OrderItem models to Prisma schema.

**Acceptance Criteria:**
- [ ] Order model with all required fields
- [ ] OrderItem model with snapshots
- [ ] Relations to User and Product
- [ ] Indexes on userId and status
- [ ] Migration created and applied

**Files to Modify:**
- `prisma/schema.prisma`

**Commands:**
```bash
npx prisma migrate dev --name add_order_models
```

**Testing:**
```bash
npx prisma studio
# Verify Order and OrderItem tables
```

---

### [TASK-302] Install and configure Stripe
**Complexity:** Medium
**Priority:** P0
**Dependencies:** None
**Estimated Time:** 2 hours

**Description:**
Install Stripe SDK and configure API keys.

**Acceptance Criteria:**
- [ ] stripe package installed
- [ ] @stripe/stripe-js installed
- [ ] @stripe/react-stripe-js installed
- [ ] Environment variables configured
- [ ] Stripe instance created in utils
- [ ] Test mode confirmed working

**Dependencies:**
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Files to Create:**
- `lib/utils/stripe.ts`

**Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Testing:**
- Import Stripe in server action
- No initialization errors

---

### [TASK-303] Create checkout address page (Step 1)
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-205]
**Estimated Time:** 3 hours

**Description:**
Create first step of checkout with shipping address form.

**Acceptance Criteria:**
- [ ] Multi-step checkout layout (progress indicator)
- [ ] Address form (name, street, city, state, zip, country)
- [ ] Validation (Zod schema)
- [ ] Save to user addresses (if logged in)
- [ ] Select from saved addresses
- [ ] "Continue to Payment" button
- [ ] Store address in checkout state

**Files to Create:**
- `app/(root)/checkout/page.tsx`
- `app/(root)/checkout/layout.tsx`
- `components/checkout/address-form.tsx`
- `components/checkout/checkout-steps.tsx`
- `lib/validations/address.ts`

**Testing:**
- Navigate to /checkout
- Fill address form
- Validate all fields
- Submit → proceed to payment

---

### [TASK-304] Create payment page (Step 2)
**Complexity:** High
**Priority:** P0
**Dependencies:** [TASK-302, TASK-303]
**Estimated Time:** 4 hours

**Description:**
Create payment step with Stripe Elements integration.

**Acceptance Criteria:**
- [ ] Display order summary
- [ ] Create payment intent (server action)
- [ ] Mount Stripe Payment Element
- [ ] Handle payment submission
- [ ] Loading state during payment
- [ ] Error handling
- [ ] Success redirect

**Files to Create:**
- `app/(root)/checkout/payment/page.tsx`
- `components/checkout/payment-form.tsx`
- `lib/actions/payment.actions.ts`

**Server Action:**
```typescript
createPaymentIntent(amount: number): Promise<{ clientSecret: string }>
```

**Testing:**
- Use Stripe test card: 4242 4242 4242 4242
- Submit payment → success
- Try declining card → error
- Network error → retry

---

### [TASK-305] Create order review page (Step 3)
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-303]
**Estimated Time:** 2 hours

**Description:**
Create final review step before payment confirmation.

**Acceptance Criteria:**
- [ ] Display all order details
- [ ] Show items, quantities, prices
- [ ] Show shipping address
- [ ] Show price breakdown (subtotal, tax, shipping, total)
- [ ] "Edit" buttons to go back to previous steps
- [ ] "Place Order" button
- [ ] Terms and conditions checkbox

**Files to Create:**
- `app/(root)/checkout/review/page.tsx`
- `components/checkout/order-review.tsx`

**Testing:**
- Navigate through checkout
- Review page shows correct info
- Edit buttons work
- Place order proceeds to payment

---

### [TASK-306] Create order server actions
**Complexity:** High
**Priority:** P0
**Dependencies:** [TASK-301, TASK-304]
**Estimated Time:** 3 hours

**Description:**
Create server actions for order management.

**Acceptance Criteria:**
- [ ] createOrder(data) - create new order
- [ ] getOrder(id) - fetch single order
- [ ] getUserOrders() - fetch user's orders
- [ ] updateOrderStatus(id, status) - admin only
- [ ] cancelOrder(id) - user can cancel pending
- [ ] Generate unique order number
- [ ] Reduce product stock on order
- [ ] Clear cart after order

**Files to Create:**
- `lib/actions/order.actions.ts`
- `lib/validations/order.ts`

**Order Number Format:**
```
ORD-20250104-001
```

**Testing:**
- Create order → database updated
- Stock reduced correctly
- Cart cleared
- Order number unique

---

### [TASK-307] Create Stripe webhook handler
**Complexity:** High
**Priority:** P0
**Dependencies:** [TASK-302, TASK-306]
**Estimated Time:** 3 hours

**Description:**
Create webhook endpoint to handle Stripe payment events.

**Acceptance Criteria:**
- [ ] Webhook route at /api/webhooks/stripe
- [ ] Verify webhook signature
- [ ] Handle payment_intent.succeeded
- [ ] Handle payment_intent.failed
- [ ] Update order status
- [ ] Send confirmation email
- [ ] Error logging

**Files to Create:**
- `app/api/webhooks/stripe/route.ts`

**Stripe CLI Setup:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Testing:**
- Trigger test webhook
- Verify order status updated
- Verify email sent
- Test signature verification

---

### [TASK-308] Create order confirmation page
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-306]
**Estimated Time:** 2 hours

**Description:**
Create order confirmation page shown after successful payment.

**Acceptance Criteria:**
- [ ] Display order number
- [ ] Display order details
- [ ] Display estimated delivery
- [ ] "View Order" button
- [ ] "Continue Shopping" button
- [ ] Print receipt button
- [ ] Success message and icon

**Files to Create:**
- `app/(root)/checkout/success/page.tsx`
- `components/checkout/order-confirmation.tsx`

**Testing:**
- Complete checkout
- Redirected to success page
- Order details correct
- Links work

---

### [TASK-309] Create order history page
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-306]
**Estimated Time:** 2.5 hours

**Description:**
Create user dashboard page showing order history.

**Acceptance Criteria:**
- [ ] List all user's orders
- [ ] Show order number, date, status, total
- [ ] Click to view order details
- [ ] Filter by status
- [ ] Pagination if > 10 orders
- [ ] Empty state for no orders

**Files to Create:**
- `app/(dashboard)/orders/page.tsx`
- `app/(dashboard)/layout.tsx` (dashboard layout)
- `components/dashboard/order-list.tsx`
- `components/dashboard/order-card.tsx`

**Testing:**
- Navigate to /dashboard/orders
- See list of orders
- Click order → view details
- Filter by status → works

---

## Phase 4: Admin Panel
**Duration:** Week 5-6 (Days 33-42)
**Goal:** Build admin dashboard and management tools

---

### [TASK-401] Create admin layout and navigation
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-103]
**Estimated Time:** 3 hours

**Description:**
Create admin panel layout with sidebar navigation.

**Acceptance Criteria:**
- [ ] Sidebar with navigation links
- [ ] Dashboard, Products, Orders, Users links
- [ ] Active state for current page
- [ ] Mobile responsive (hamburger menu)
- [ ] Admin badge/indicator
- [ ] Logout button

**Files to Create:**
- `app/(admin)/layout.tsx`
- `components/admin/admin-sidebar.tsx`
- `components/admin/admin-header.tsx`

**Testing:**
- Navigate to /admin
- Verify sidebar shows
- Click links → navigation works
- Mobile → hamburger menu

---

### [TASK-402] Create admin dashboard with metrics
**Complexity:** High
**Priority:** P0
**Dependencies:** [TASK-401]
**Estimated Time:** 4 hours

**Description:**
Create admin dashboard showing key business metrics.

**Acceptance Criteria:**
- [ ] Cards for total revenue, orders, users
- [ ] Chart of sales over time (last 30 days)
- [ ] Recent orders table (last 10)
- [ ] Low stock alerts (stock < 5)
- [ ] Top selling products
- [ ] Metrics calculated via server action

**Files to Create:**
- `app/(admin)/dashboard/page.tsx`
- `components/admin/metric-card.tsx`
- `components/admin/sales-chart.tsx`
- `lib/actions/admin.actions.ts`

**Dependencies:**
```bash
npm install recharts
```

**Testing:**
- Navigate to /admin/dashboard
- Verify metrics display
- Check calculations are correct
- Chart renders properly

---

### [TASK-403] Create admin orders page
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-401, TASK-306]
**Estimated Time:** 3 hours

**Description:**
Create admin page to view and manage all orders.

**Acceptance Criteria:**
- [ ] Table of all orders
- [ ] Columns: order number, customer, date, total, status
- [ ] Filter by status
- [ ] Search by order number or customer name
- [ ] Click to view order details
- [ ] Update order status dropdown
- [ ] Pagination

**Files to Create:**
- `app/(admin)/orders/page.tsx`
- `components/admin/orders-table.tsx`

**Testing:**
- Navigate to /admin/orders
- See all orders
- Filter by status → works
- Update status → database updated
- Search → finds orders

---

### [TASK-404] Create admin order detail page
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-403]
**Estimated Time:** 2 hours

**Description:**
Create detailed view of single order for admin.

**Acceptance Criteria:**
- [ ] Display all order information
- [ ] Customer details
- [ ] Items ordered
- [ ] Payment information
- [ ] Shipping address
- [ ] Order status history
- [ ] Update status action
- [ ] Print invoice button

**Files to Create:**
- `app/(admin)/orders/[id]/page.tsx`
- `components/admin/order-detail.tsx`

**Testing:**
- Click order from list
- Verify all details shown
- Update status → success
- Print invoice → formatted page

---

### [TASK-405] Create admin users page
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-401]
**Estimated Time:** 3 hours

**Description:**
Create admin page to view and manage users.

**Acceptance Criteria:**
- [ ] Table of all users
- [ ] Columns: name, email, role, joined date
- [ ] Search by name or email
- [ ] Update user role (user/admin)
- [ ] View user's orders
- [ ] Pagination
- [ ] Can't change own role

**Files to Create:**
- `app/(admin)/users/page.tsx`
- `components/admin/users-table.tsx`
- `lib/actions/admin.actions.ts` (updateUserRole)

**Testing:**
- Navigate to /admin/users
- See all users
- Search → finds users
- Update role → database updated
- Can't change own role → disabled

---

### [TASK-406] Add admin access middleware check
**Complexity:** Low
**Priority:** P0
**Dependencies:** [TASK-103, TASK-401]
**Estimated Time:** 1 hour

**Description:**
Ensure admin routes are protected and redirect non-admins.

**Acceptance Criteria:**
- [ ] /admin routes require authentication
- [ ] /admin routes require admin role
- [ ] Non-admins redirected to /
- [ ] Error message shown

**Files to Modify:**
- `middleware.ts`

**Testing:**
- Log in as user → access /admin → redirect
- Log in as admin → access /admin → success
- Logged out → access /admin → redirect to sign-in

---

### [TASK-407] Create admin analytics page (optional)
**Complexity:** High
**Priority:** P2
**Dependencies:** [TASK-402]
**Estimated Time:** 4 hours

**Description:**
Create detailed analytics page with charts and insights.

**Acceptance Criteria:**
- [ ] Sales by category chart
- [ ] Sales by month chart
- [ ] Customer acquisition chart
- [ ] Product performance table
- [ ] Export to CSV button
- [ ] Date range selector

**Files to Create:**
- `app/(admin)/analytics/page.tsx`
- `components/admin/analytics-charts.tsx`

**Testing:**
- Navigate to /admin/analytics
- Verify charts render
- Select date range → data updates
- Export CSV → downloads file

---

### [TASK-408] Add low stock email alerts
**Complexity:** Medium
**Priority:** P2
**Dependencies:** [TASK-402]
**Estimated Time:** 2 hours

**Description:**
Send email alert to admin when product stock is low.

**Acceptance Criteria:**
- [ ] Check stock after each order
- [ ] If stock < 5, send email
- [ ] Email lists low stock products
- [ ] Only send once per day per product
- [ ] Admin can configure threshold

**Files to Create:**
- `lib/utils/inventory.ts`
- `emails/low-stock-alert.tsx`

**Testing:**
- Place order that reduces stock < 5
- Verify email sent
- Check email content
- Verify not sent again within 24hrs

---

## Phase 5: Product Management
**Duration:** Week 6-7 (Days 40-49)
**Goal:** Enable admin to manage product catalog

---

### [TASK-501] Install and configure UploadThing
**Complexity:** Medium
**Priority:** P0
**Dependencies:** None
**Estimated Time:** 2 hours

**Description:**
Set up UploadThing for product image uploads.

**Acceptance Criteria:**
- [ ] uploadthing package installed
- [ ] @uploadthing/react installed
- [ ] UploadThing API key configured
- [ ] File router created (max 5 images)
- [ ] Route handler created
- [ ] Image size limit: 4MB per image

**Dependencies:**
```bash
npm install uploadthing @uploadthing/react
```

**Files to Create:**
- `lib/uploadthing.ts`
- `app/api/uploadthing/route.ts`

**Environment Variables:**
```env
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
```

**Testing:**
- Upload test image
- Verify URL returned
- Image accessible at URL

---

### [TASK-502] Create product form component
**Complexity:** High
**Priority:** P0
**Dependencies:** [TASK-501]
**Estimated Time:** 4 hours

**Description:**
Create reusable form component for creating/editing products.

**Acceptance Criteria:**
- [ ] All product fields (name, slug, category, brand, etc.)
- [ ] Image upload with preview
- [ ] Drag & drop for images
- [ ] Remove image button
- [ ] Auto-generate slug from name
- [ ] Validation (Zod)
- [ ] Loading state on submit
- [ ] Error handling

**Files to Create:**
- `components/admin/product-form.tsx`
- `components/admin/image-upload.tsx`

**Dependencies:**
```bash
npm install react-hook-form @hookform/resolvers
```

**Testing:**
- Fill form → validation works
- Upload images → preview shows
- Auto-slug generation works
- Submit → data saved

---

### [TASK-503] Create admin product create page
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-502]
**Estimated Time:** 2 hours

**Description:**
Create page for admin to add new products.

**Acceptance Criteria:**
- [ ] Form for new product
- [ ] Submit creates product
- [ ] Redirect to product list on success
- [ ] Success toast notification
- [ ] Error handling

**Files to Create:**
- `app/(admin)/products/new/page.tsx`
- `lib/actions/product.actions.ts` (createProduct)

**Testing:**
- Navigate to /admin/products/new
- Fill form
- Submit → product created
- Redirect to /admin/products

---

### [TASK-504] Create admin products list page
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-401]
**Estimated Time:** 3 hours

**Description:**
Create page listing all products with admin actions.

**Acceptance Criteria:**
- [ ] Table of all products
- [ ] Columns: image, name, category, price, stock, actions
- [ ] Search by name
- [ ] Filter by category
- [ ] Sort by name, price, stock
- [ ] Edit button → edit page
- [ ] Delete button → confirmation modal
- [ ] Bulk delete (select multiple)
- [ ] Pagination

**Files to Create:**
- `app/(admin)/products/page.tsx`
- `components/admin/products-table.tsx`

**Testing:**
- Navigate to /admin/products
- See all products
- Search → finds products
- Delete → confirmation → deleted
- Bulk delete → works

---

### [TASK-505] Create admin product edit page
**Complexity:** Medium
**Priority:** P0
**Dependencies:** [TASK-502, TASK-504]
**Estimated Time:** 2 hours

**Description:**
Create page for editing existing products.

**Acceptance Criteria:**
- [ ] Form pre-filled with product data
- [ ] Can update all fields
- [ ] Can replace images
- [ ] Can delete product
- [ ] Save button updates product
- [ ] Cancel returns to list

**Files to Create:**
- `app/(admin)/products/[id]/page.tsx`
- `lib/actions/product.actions.ts` (updateProduct, deleteProduct)

**Testing:**
- Click edit from list
- Form shows current data
- Update fields
- Save → updates database
- Verify on product page

---

### [TASK-506] Create category management
**Complexity:** Medium
**Priority:** P2
**Dependencies:** [TASK-504]
**Estimated Time:** 3 hours

**Description:**
Add ability to create and manage product categories.

**Acceptance Criteria:**
- [ ] Category model in database
- [ ] List categories page
- [ ] Add category form
- [ ] Edit category
- [ ] Delete category (if no products)
- [ ] Assign products to categories

**Files to Create:**
- `app/(admin)/categories/page.tsx`
- `components/admin/category-form.tsx`
- `lib/actions/category.actions.ts`

**Schema Addition:**
```prisma
model Category {
  id       String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name     String    @unique
  slug     String    @unique
  products Product[]
}
```

**Testing:**
- Create category → saved
- Assign to product → works
- Delete category with products → error
- Delete empty category → success

---

## Phase 6: Reviews & Ratings
**Duration:** Week 7-8 (Days 47-56)
**Goal:** Enable users to review and rate products

---

### [TASK-601] Create Review database model
**Complexity:** Low
**Priority:** P1
**Dependencies:** [TASK-301]
**Estimated Time:** 1 hour

**Description:**
Add Review model to Prisma schema.

**Acceptance Criteria:**
- [ ] Review model with all fields
- [ ] Relations to User and Product
- [ ] Unique constraint on productId + userId
- [ ] Index on productId
- [ ] Migration applied

**Files to Modify:**
- `prisma/schema.prisma`

**Commands:**
```bash
npx prisma migrate dev --name add_review_model
```

**Testing:**
```bash
npx prisma studio
# Verify Review table exists
```

---

### [TASK-602] Create review server actions
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-601]
**Estimated Time:** 2 hours

**Description:**
Create server actions for review CRUD operations.

**Acceptance Criteria:**
- [ ] createReview(data)
- [ ] updateReview(id, data)
- [ ] deleteReview(id)
- [ ] getProductReviews(productId)
- [ ] User can only review once per product
- [ ] User must have purchased product
- [ ] Update product average rating
- [ ] Validation (Zod)

**Files to Create:**
- `lib/actions/review.actions.ts`
- `lib/validations/review.ts`

**Testing:**
- Create review → saved
- Try duplicate → error
- Update rating → product average updates
- Delete review → removed

---

### [TASK-603] Create review form component
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-602]
**Estimated Time:** 2.5 hours

**Description:**
Create form for submitting/editing reviews.

**Acceptance Criteria:**
- [ ] Star rating selector (1-5)
- [ ] Review text area (50-500 chars)
- [ ] Character counter
- [ ] Submit button
- [ ] Cancel button
- [ ] Validation
- [ ] Loading state

**Files to Create:**
- `components/shared/product/review-form.tsx`
- `components/shared/product/star-rating-input.tsx`

**Testing:**
- Click stars → rating selected
- Type review → counter updates
- Submit → review saved
- Validation errors shown

---

### [TASK-604] Display reviews on product page
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-602]
**Estimated Time:** 2.5 hours

**Description:**
Show product reviews on product detail page.

**Acceptance Criteria:**
- [ ] List all reviews for product
- [ ] Show user name, date, rating, comment
- [ ] Sort by newest first
- [ ] Pagination (10 per page)
- [ ] Average rating display
- [ ] Total review count
- [ ] User can edit/delete own review

**Files to Modify:**
- `app/(root)/product/[slug]/page.tsx`

**Files to Create:**
- `components/shared/product/review-list.tsx`
- `components/shared/product/review-item.tsx`

**Testing:**
- Navigate to product page
- Scroll to reviews section
- See all reviews
- Pagination works
- Edit own review → form appears

---

### [TASK-605] Update product card with rating
**Complexity:** Low
**Priority:** P1
**Dependencies:** [TASK-602]
**Estimated Time:** 1 hour

**Description:**
Show average rating on product cards.

**Acceptance Criteria:**
- [ ] Star icons showing average rating
- [ ] Review count displayed
- [ ] "No reviews yet" if none
- [ ] Matches product detail page

**Files to Modify:**
- `components/shared/product/product-card.tsx`

**Testing:**
- Navigate to homepage
- Product cards show correct ratings
- Matches detail page rating

---

## Phase 7: Search & Filters
**Duration:** Week 8-9 (Days 54-63)
**Goal:** Implement product search and filtering

---

### [TASK-701] Create search server action
**Complexity:** Medium
**Priority:** P1
**Dependencies:** None
**Estimated Time:** 2 hours

**Description:**
Create server action for full-text product search.

**Acceptance Criteria:**
- [ ] Search by product name
- [ ] Search by description
- [ ] Case-insensitive search
- [ ] Debounced input (300ms)
- [ ] Return matching products
- [ ] Highlight search terms (optional)

**Files to Create:**
- `lib/actions/search.actions.ts`

**Prisma Query:**
```typescript
prisma.product.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  },
})
```

**Testing:**
- Search "polo" → finds Polo products
- Search "shirt" → finds all shirts
- Case variations work

---

### [TASK-702] Create search page with results
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-701]
**Estimated Time:** 3 hours

**Description:**
Create search results page with grid layout.

**Acceptance Criteria:**
- [ ] Search input at top
- [ ] Display matching products in grid
- [ ] Show result count
- [ ] Empty state for no results
- [ ] Search query in URL (?q=...)
- [ ] Can search from any page
- [ ] Pagination

**Files to Create:**
- `app/(root)/search/page.tsx`
- `components/shared/search-bar.tsx`

**Testing:**
- Type in search box → results show
- Empty search → show popular products
- No results → empty state
- URL updates with query

---

### [TASK-703] Create filter sidebar component
**Complexity:** High
**Priority:** P1
**Dependencies:** [TASK-702]
**Estimated Time:** 4 hours

**Description:**
Create sidebar with filter options.

**Acceptance Criteria:**
- [ ] Category filter (checkboxes)
- [ ] Brand filter (checkboxes)
- [ ] Price range slider ($0-$200)
- [ ] In stock toggle
- [ ] Clear filters button
- [ ] Filters work together (AND logic)
- [ ] Filter state in URL
- [ ] Mobile: collapsible drawer

**Files to Create:**
- `components/shared/product/filter-sidebar.tsx`
- `components/shared/product/price-range-slider.tsx`

**Dependencies:**
```bash
npm install @radix-ui/react-slider
```

**Testing:**
- Select category → filters products
- Select multiple filters → works
- Price slider → filters by range
- Clear filters → resets all

---

### [TASK-704] Implement sort functionality
**Complexity:** Low
**Priority:** P1
**Dependencies:** [TASK-702]
**Estimated Time:** 1.5 hours

**Description:**
Add sort dropdown to product listing.

**Acceptance Criteria:**
- [ ] Sort by: Price Low-High, High-Low, Rating, Newest
- [ ] Dropdown in top-right of page
- [ ] Sort state in URL
- [ ] Works with filters and search

**Files to Create:**
- `components/shared/product/sort-dropdown.tsx`

**Testing:**
- Select "Price Low-High" → products sorted
- Change to "Rating" → re-sorted
- Works with filters enabled

---

### [TASK-705] Add search to header
**Complexity:** Medium
**Priority:** P1
**Dependencies:** [TASK-701]
**Estimated Time:** 2 hours

**Description:**
Add search bar to header with autocomplete.

**Acceptance Criteria:**
- [ ] Search input in header
- [ ] Autocomplete dropdown (top 5 results)
- [ ] Click result → go to product page
- [ ] Enter key → go to search page
- [ ] Mobile: expand on click
- [ ] Debounced (300ms)

**Files to Modify:**
- `components/shared/header/index.tsx`

**Files to Create:**
- `components/shared/header/search-input.tsx`
- `components/shared/header/search-autocomplete.tsx`

**Testing:**
- Type in search → autocomplete appears
- Click result → navigate to product
- Press Enter → go to search page
- Mobile → expands properly

---

## Phase 8: User Profile
**Duration:** Week 9 (Days 61-67)
**Goal:** Enable users to manage their profile and settings

---

### [TASK-801] Create user profile page
**Complexity:** Medium
**Priority:** P2
**Dependencies:** [TASK-108]
**Estimated Time:** 2.5 hours

**Description:**
Create profile page showing user information.

**Acceptance Criteria:**
- [ ] Display name, email, profile image
- [ ] Join date
- [ ] Account status (verified/unverified)
- [ ] Edit profile button
- [ ] Tabs for: Profile, Addresses, Security
- [ ] Mobile responsive

**Files to Create:**
- `app/(dashboard)/profile/page.tsx`
- `components/dashboard/profile-header.tsx`

**Testing:**
- Navigate to /dashboard/profile
- See user info
- Tabs work
- Mobile responsive

---

### [TASK-802] Create edit profile form
**Complexity:** Medium
**Priority:** P2
**Dependencies:** [TASK-801]
**Estimated Time:** 2 hours

**Description:**
Allow user to update profile information.

**Acceptance Criteria:**
- [ ] Edit name
- [ ] Edit email (requires re-verification)
- [ ] Upload profile image
- [ ] Save button
- [ ] Cancel button
- [ ] Validation
- [ ] Success message

**Files to Create:**
- `components/dashboard/edit-profile-form.tsx`
- `lib/actions/user.actions.ts` (updateProfile)

**Testing:**
- Click edit → form appears
- Change name → saved
- Change email → verification sent
- Upload image → saved

---

### [TASK-803] Create address management
**Complexity:** Medium
**Priority:** P2
**Dependencies:** [TASK-801]
**Estimated Time:** 3 hours

**Description:**
Allow user to manage shipping addresses.

**Acceptance Criteria:**
- [ ] List all addresses (max 3)
- [ ] Add new address
- [ ] Edit address
- [ ] Delete address
- [ ] Set default address
- [ ] Use in checkout

**Files to Create:**
- `app/(dashboard)/addresses/page.tsx`
- `components/dashboard/address-list.tsx`
- `components/dashboard/address-form.tsx`
- `lib/actions/address.actions.ts`

**Testing:**
- Add address → saved
- Set default → checkbox works
- Edit → updates
- Delete → removed
- Use in checkout → pre-filled

---

### [TASK-804] Create change password form
**Complexity:** Low
**Priority:** P2
**Dependencies:** [TASK-801]
**Estimated Time:** 1.5 hours

**Description:**
Allow user to change password.

**Acceptance Criteria:**
- [ ] Current password field
- [ ] New password field
- [ ] Confirm password field
- [ ] Validation (current password correct)
- [ ] Password strength indicator
- [ ] Success message

**Files to Create:**
- `app/(dashboard)/security/page.tsx`
- `components/dashboard/change-password-form.tsx`
- `lib/actions/user.actions.ts` (updatePassword)

**Testing:**
- Enter wrong current password → error
- New password weak → error
- Passwords don't match → error
- Submit valid → success

---

## Phase 9: Polish & SEO
**Duration:** Week 10 (Days 68-70)
**Goal:** Final polish, optimization, and SEO

---

### [TASK-901] Add generateMetadata to all pages
**Complexity:** Medium
**Priority:** P1
**Dependencies:** None
**Estimated Time:** 2 hours

**Description:**
Add dynamic metadata to all pages for SEO.

**Acceptance Criteria:**
- [ ] Product pages: dynamic title, description, OG image
- [ ] Homepage: metadata
- [ ] Category pages: metadata
- [ ] Search page: dynamic metadata
- [ ] Admin pages: noindex
- [ ] Canonical URLs

**Files to Modify:**
- `app/(root)/product/[slug]/page.tsx`
- `app/(root)/page.tsx`
- `app/(root)/search/page.tsx`

**Example:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  }
}
```

**Testing:**
- View page source → meta tags present
- Share link → preview shows correct info

---

### [TASK-902] Add error boundaries
**Complexity:** Low
**Priority:** P1
**Dependencies:** None
**Estimated Time:** 1.5 hours

**Description:**
Add error.tsx files to handle runtime errors gracefully.

**Acceptance Criteria:**
- [ ] Global error boundary (app/error.tsx)
- [ ] Product error boundary
- [ ] Checkout error boundary
- [ ] Admin error boundary
- [ ] Friendly error messages
- [ ] "Try again" button
- [ ] Report error (optional)

**Files to Create:**
- `app/error.tsx`
- `app/(root)/product/[slug]/error.tsx`
- `app/(root)/checkout/error.tsx`
- `app/(admin)/error.tsx`

**Testing:**
- Trigger error → error boundary catches
- Click "Try again" → retries
- Error logged properly

---

### [TASK-903] Add loading states
**Complexity:** Low
**Priority:** P1
**Dependencies:** None
**Estimated Time:** 1.5 hours

**Description:**
Add loading.tsx files for better UX during navigation.

**Acceptance Criteria:**
- [ ] Skeleton loaders for product grids
- [ ] Skeleton loaders for product details
- [ ] Loading spinners for forms
- [ ] Shimmer effect
- [ ] Accessible (aria-busy)

**Files to Create:**
- `app/(root)/loading.tsx`
- `app/(root)/product/[slug]/loading.tsx`
- `app/(admin)/loading.tsx`
- `components/shared/skeleton-loader.tsx`

**Testing:**
- Navigate between pages → see loading state
- Slow 3G simulation → loaders work

---

### [TASK-904] Performance optimization
**Complexity:** High
**Priority:** P1
**Dependencies:** None
**Estimated Time:** 4 hours

**Description:**
Optimize application for performance.

**Acceptance Criteria:**
- [ ] Image optimization (all images use next/image)
- [ ] Lazy load below-fold images
- [ ] Database query optimization (add indexes)
- [ ] Bundle size < 200KB
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals green
- [ ] Route preloading

**Tasks:**
- Analyze bundle with `@next/bundle-analyzer`
- Add database indexes for common queries
- Lazy load heavy components
- Enable ISR for product pages

**Testing:**
```bash
npm run build
npx lighthouse http://localhost:3000
```

---

### [TASK-905] Final testing and bug fixes
**Complexity:** Medium
**Priority:** P0
**Dependencies:** All previous tasks
**Estimated Time:** 4 hours

**Description:**
Comprehensive testing across all features and devices.

**Acceptance Criteria:**
- [ ] Test all user flows (sign up → browse → add to cart → checkout)
- [ ] Test admin flows (create product → manage orders)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Desktop testing (Chrome, Firefox, Safari)
- [ ] Accessibility audit
- [ ] Fix all critical bugs
- [ ] No console errors/warnings

**Testing Checklist:**
- [ ] Authentication works
- [ ] Cart persists
- [ ] Checkout completes
- [ ] Orders created
- [ ] Admin can manage products
- [ ] Reviews work
- [ ] Search works
- [ ] Filters work
- [ ] All links work
- [ ] Forms validate
- [ ] Images load
- [ ] Mobile responsive

**Tools:**
- Browser DevTools
- Lighthouse
- WAVE (accessibility)
- BrowserStack (cross-browser)

---

## Appendix

### Task Status Legend
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- 🔵 Blocked
- ⚪ Skipped

### Complexity Guide
- **Low**: 0.5-2 hours, straightforward implementation
- **Medium**: 2-4 hours, requires planning and testing
- **High**: 4+ hours, complex logic or integrations

### Priority Guide
- **P0**: Must have for MVP (blocks other features)
- **P1**: Should have for launch (important but not blocking)
- **P2**: Nice to have (can be added post-launch)

### How to Use This Document

1. **Start with Phase 0**: Always fix bugs first
2. **Complete phases in order**: Each phase builds on previous
3. **Check dependencies**: Ensure dependent tasks are done first
4. **Update status**: Mark tasks as complete when done
5. **Test thoroughly**: Follow testing instructions for each task
6. **Commit often**: Commit after each task completion

### Git Workflow

```bash
# Start a task
git checkout -b feature/TASK-XXX-description

# Make changes
# ...

# Commit
git add .
git commit -m "feat: [TASK-XXX] Task description"

# Push and create PR
git push origin feature/TASK-XXX-description

# After review and merge
git checkout main
git pull

# Start next task
git checkout -b feature/TASK-YYY-next-task
```

### Progress Tracking

Update this table as you complete tasks:

| Task ID | Status | Completed Date |
|---------|--------|----------------|
| TASK-001 | 🔴 | - |
| TASK-002 | 🔴 | - |
| ... | ... | ... |

### Notes
- Adjust time estimates based on your experience
- Some tasks can be parallelized if working in a team
- Focus on getting each phase fully working before moving to next
- **NEVER skip testing steps** - Tests are mandatory
- Document any deviations from the plan

---

## Testing Appendix

### Test-First Workflow (Step by Step)

**For Every Task, Follow This Process:**

#### Step 1: Set Up Test File
```bash
# Create test file
mkdir -p __tests__/lib/actions
touch __tests__/lib/actions/cart.actions.test.ts
```

#### Step 2: Write Failing Tests (RED)
```typescript
// __tests__/lib/actions/cart.actions.test.ts
import { addToCart } from '@/lib/actions/cart.actions'

describe('Cart Actions', () => {
  it('should add item to cart', async () => {
    const result = await addToCart('product-id', 2)

    expect(result).toBeDefined()
    expect(result.items).toHaveLength(1)
    expect(result.items[0].quantity).toBe(2)
  })
})
```

#### Step 3: Run Tests (Should Fail)
```bash
npm test __tests__/lib/actions/cart.actions.test.ts
# ❌ FAIL - Function doesn't exist yet
```

#### Step 4: Implement Code (GREEN)
```typescript
// lib/actions/cart.actions.ts
'use server'

export async function addToCart(productId: string, quantity: number) {
  // Implementation that makes tests pass
  return { items: [{ productId, quantity }] }
}
```

#### Step 5: Run Tests Again (Should Pass)
```bash
npm test __tests__/lib/actions/cart.actions.test.ts
# ✅ PASS - All tests passing
```

#### Step 6: Refactor (Keep Tests Green)
```typescript
// Improve code quality while keeping tests green
export async function addToCart(productId: string, quantity: number) {
  // Refactored, cleaner code
  const item = createCartItem(productId, quantity)
  return { items: [item] }
}
```

#### Step 7: Manual Testing
```bash
npm run dev
# Navigate to product page
# Click "Add to Cart"
# Verify it works in browser
```

#### Step 8: Check Coverage
```bash
npm test -- --coverage __tests__/lib/actions/cart.actions.test.ts
# Verify coverage meets requirements
```

#### Step 9: Mark Complete (Only if ALL tests pass)
- [ ] Implementation complete ✅
- [ ] Tests written ✅
- [ ] All tests passing ✅
- [ ] Coverage meets threshold ✅
- [ ] No TypeScript errors ✅
- [ ] No lint errors ✅
- [ ] Manual verification ✅

---

### Test Patterns by Type

#### 1. Utility Functions (100% Coverage Required)
```typescript
// __tests__/lib/utils.test.ts
import { formatPrice } from '@/lib/utils'

describe('formatPrice', () => {
  it.each([
    [10, '$10.00'],
    [10.5, '$10.50'],
    [99.99, '$99.99'],
    [0, '$0.00'],
  ])('should format %p as %p', (input, expected) => {
    expect(formatPrice(input)).toBe(expected)
  })

  it('should throw error for negative numbers', () => {
    expect(() => formatPrice(-10)).toThrow()
  })
})
```

#### 2. Zod Validation Schemas (100% Coverage Required)
```typescript
// __tests__/lib/validations/auth.test.ts
import { signUpSchema } from '@/lib/validations/auth'

describe('signUpSchema', () => {
  it('should validate correct data', () => {
    const valid = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    }
    expect(() => signUpSchema.parse(valid)).not.toThrow()
  })

  it('should reject invalid email', () => {
    const invalid = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'Password123',
    }
    expect(() => signUpSchema.parse(invalid)).toThrow()
  })

  it('should reject weak password', () => {
    const invalid = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'weak',
    }
    expect(() => signUpSchema.parse(invalid)).toThrow()
  })
})
```

#### 3. Server Actions (90% Coverage Required)
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

    ;(prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct)

    const result = await getProductBySlug('test-product')

    expect(result).toEqual(mockProduct)
    expect(prisma.product.findFirst).toHaveBeenCalledWith({
      where: { slug: 'test-product' },
    })
  })

  it('should return null for non-existent slug', async () => {
    ;(prisma.product.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await getProductBySlug('non-existent')

    expect(result).toBeNull()
  })
})
```

#### 4. React Components (70% Coverage Required)
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

  it('should show "Out of Stock" when stock is 0', () => {
    const outOfStock = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStock} />)

    expect(screen.getByText('Out Of Stock')).toBeInTheDocument()
  })

  it('should link to product detail page', () => {
    render(<ProductCard product={mockProduct} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/product/test-product')
  })
})
```

#### 5. User Interactions (Testing Library User Events)
```typescript
// __tests__/components/shared/cart/add-to-cart-button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddToCartButton from '@/components/shared/cart/add-to-cart-button'

describe('AddToCartButton', () => {
  it('should call addToCart when clicked', async () => {
    const mockAddToCart = jest.fn()
    const user = userEvent.setup()

    render(
      <AddToCartButton
        productId="1"
        onAdd={mockAddToCart}
      />
    )

    const button = screen.getByRole('button', { name: /add to cart/i })
    await user.click(button)

    expect(mockAddToCart).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when out of stock', () => {
    render(
      <AddToCartButton
        productId="1"
        stock={0}
        onAdd={jest.fn()}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
```

---

### Common Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test __tests__/lib/utils.test.ts

# Run tests in watch mode
npm test:watch

# Run with coverage
npm test:coverage

# Run tests for specific pattern
npm test cart

# Update snapshots (if using)
npm test -- -u

# Run only failed tests
npm test -- --onlyFailures

# Verbose output
npm test -- --verbose
```

---

### Coverage Requirements Enforcement

**Coverage thresholds are set in jest.config.js:**
```javascript
coverageThresholds: {
  global: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
  },
}
```

**If coverage drops below threshold:**
```bash
npm test:coverage
# ❌ FAIL - Coverage below threshold
# Tests will fail and task cannot be marked complete
```

---

### Pre-Commit Checklist (For Every Task)

Before marking any task complete, run:

```bash
# 1. Type check
npx tsc --noEmit
# Must pass ✅

# 2. Lint
npm run lint
# Must pass ✅

# 3. Tests
npm test
# All tests must pass ✅

# 4. Coverage
npm test:coverage
# Must meet threshold ✅

# 5. Build check
npm run build
# Must build successfully ✅
```

**If ANY of these fail, task is NOT complete!**

---

**Good luck building Proshopp! 🚀**

**Remember: 🔴 Tests are not optional - they are mandatory! 🔴**
