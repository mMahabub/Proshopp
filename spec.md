# Proshopp - Technical Specification

**Version:** 1.1 (Test-First Update)
**Last Updated:** October 4, 2025
**Current Completion:** 18% → Target: 100%
**Testing:** 🔴 MANDATORY - All features must have tests before completion

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Database Schema](#database-schema)
4. [API Specification](#api-specification)
5. [UI/UX Requirements](#uiux-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)

---

## Project Overview

### Purpose
Proshopp is a modern, full-featured e-commerce platform for selling men's apparel online. The application supports product browsing, user authentication, shopping cart, checkout, order management, and admin operations.

### Target Users
- **Customers**: Browse products, add to cart, checkout, manage orders
- **Admins**: Manage products, view orders, update inventory, manage users

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: Auth.js v5
- **Payments**: Stripe
- **State Management**: Zustand
- **Styling**: Tailwind CSS, shadcn/ui

---

## Core Features

### 1. Authentication System

#### Requirements
- Email/password authentication
- OAuth providers (Google, GitHub)
- Email verification
- Password reset flow
- Role-based access control (user, admin)
- Session management with 30-day expiry

#### Acceptance Criteria
- ✅ Users can sign up with email/password
- ✅ Users can sign in with Google/GitHub
- ✅ Email verification required before first login
- ✅ Password reset via email link
- ✅ Protected routes redirect to sign-in
- ✅ Admin routes only accessible to admin role
- ✅ Sessions persist across browser restarts
- ✅ "Remember me" functionality

#### User Flows
1. **Sign Up**: Email → Verify → Welcome email → Dashboard
2. **Sign In**: Email/Password or OAuth → Dashboard
3. **Password Reset**: Email → Token → New Password → Success

---

### 2. Shopping Cart

#### Requirements
- Add/remove items from cart
- Update item quantities
- Cart persists in localStorage
- Cart syncs to database for authenticated users
- Display cart total with tax calculation
- Cart accessible from all pages
- Empty cart state with CTA

#### Acceptance Criteria
- ✅ Add to cart button on product pages
- ✅ Cart icon shows item count badge
- ✅ Cart persists after page refresh
- ✅ Quantity selector (1-10 max per item)
- ✅ Remove item with confirmation
- ✅ Real-time total calculation
- ✅ Stock validation before adding
- ✅ Cart merges on login (local + database)

#### Data Model
```typescript
{
  id: string
  userId?: string // null for guest carts
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  price: Decimal // locked at add time
}
```

---

### 3. Checkout & Orders

#### Requirements
- Multi-step checkout flow
- Shipping address form
- Payment method selection
- Order review before payment
- Stripe payment integration
- Order confirmation email
- Order history page
- Order status tracking

#### Acceptance Criteria
- ✅ Checkout requires authentication
- ✅ Address validation (US addresses)
- ✅ Credit card payment via Stripe
- ✅ Order summary shows tax + shipping
- ✅ Stock checked before payment
- ✅ Confirmation email sent after payment
- ✅ Order appears in order history
- ✅ Order status: pending → paid → shipped → delivered

#### Checkout Flow
1. **Cart** → Review items
2. **Shipping** → Enter/select address
3. **Payment** → Stripe payment form
4. **Review** → Confirm order details
5. **Success** → Order confirmation + email

#### Data Model
```typescript
Order {
  id: string
  userId: string
  orderNumber: string // auto-generated (e.g., ORD-20250104-001)
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: Decimal
  tax: Decimal
  shipping: Decimal
  total: Decimal
  shippingAddress: Json
  paymentMethod: string
  stripePaymentIntentId?: string
  createdAt: Date
  updatedAt: Date
}

OrderItem {
  id: string
  orderId: string
  productId: string
  name: string // snapshot at purchase
  price: Decimal // snapshot at purchase
  quantity: number
  image: string // snapshot at purchase
}
```

---

### 4. Product Management (Admin)

#### Requirements
- CRUD operations for products
- Image upload (up to 5 images per product)
- Slug auto-generation from name
- Stock management
- Featured product toggle
- Category management
- Bulk actions (delete, update stock)

#### Acceptance Criteria
- ✅ Admin can create/edit/delete products
- ✅ Image upload with preview
- ✅ Slug auto-generated and editable
- ✅ Stock input with validation (0-9999)
- ✅ Mark products as featured
- ✅ Assign product to category
- ✅ Bulk delete selected products
- ✅ Form validation with error messages

#### Admin Actions
- Create product
- Edit product (all fields)
- Delete product (with confirmation)
- Update stock quantity
- Toggle featured status
- Upload/delete images

---

### 5. Product Catalog (Customer)

#### Requirements
- Product listing with grid layout
- Product detail page
- Search by name/description
- Filter by category, brand, price range
- Sort by price, rating, newest
- Pagination (12 items per page)
- Featured products section on homepage

#### Acceptance Criteria
- ✅ Grid displays 4 columns on desktop, 2 on tablet, 1 on mobile
- ✅ Search updates results in real-time
- ✅ Filters work independently and combinable
- ✅ Sort persists in URL query params
- ✅ Pagination with page numbers
- ✅ Product images lazy load
- ✅ Featured products carousel on homepage

#### Search & Filter
- **Search**: Full-text search on name + description
- **Filters**:
  - Category (multi-select)
  - Brand (multi-select)
  - Price range (slider: $0-$200)
  - In stock only (toggle)
- **Sort**:
  - Price: Low to High
  - Price: High to Low
  - Rating: High to Low
  - Newest First

---

### 6. Reviews & Ratings

#### Requirements
- Users can rate products (1-5 stars)
- Users can write reviews (optional text)
- One review per product per user
- Edit/delete own reviews
- Display average rating on product card
- Display review count
- Reviews sorted by newest first

#### Acceptance Criteria
- ✅ Review form on product page
- ✅ Star rating selector (1-5)
- ✅ Review text (50-500 characters)
- ✅ Cannot review without purchase
- ✅ Edit review within 30 days of posting
- ✅ Average rating updates on new review
- ✅ Review count shown on product card

#### Data Model
```typescript
Review {
  id: string
  productId: string
  userId: string
  rating: number // 1-5
  comment?: string
  createdAt: Date
  updatedAt: Date
}
```

---

### 7. User Profile

#### Requirements
- View/edit profile information
- Manage addresses (add/edit/delete)
- View order history
- Change password
- Delete account

#### Acceptance Criteria
- ✅ Profile page shows user info
- ✅ Edit name, email (with re-verification)
- ✅ Add up to 3 addresses
- ✅ Set default address
- ✅ View all past orders
- ✅ Change password with current password check
- ✅ Delete account with confirmation (soft delete)

#### Sections
- **Personal Info**: Name, email, profile image
- **Addresses**: Shipping addresses (max 3)
- **Orders**: Order history with status
- **Security**: Change password
- **Danger Zone**: Delete account

---

### 8. Admin Dashboard

#### Requirements
- Overview metrics (sales, orders, users)
- Recent orders table
- Low stock alerts
- User management
- Product analytics

#### Acceptance Criteria
- ✅ Dashboard shows last 30 days metrics
- ✅ Total sales, order count, new users
- ✅ Chart of sales over time
- ✅ Recent 10 orders table
- ✅ Alert for products with stock < 5
- ✅ User list with role assignment
- ✅ Top 5 selling products

#### Metrics
- Total Revenue (last 30 days)
- Total Orders (last 30 days)
- New Users (last 30 days)
- Average Order Value
- Conversion Rate

---

## Database Schema

### New Models to Add

#### Cart
```prisma
model Cart {
  id        String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String?    @db.Uuid
  items     CartItem[]
  createdAt DateTime   @default(now()) @db.Timestamp(6)
  updatedAt DateTime   @updatedAt

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model CartItem {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  cartId    String   @db.Uuid
  productId String   @db.Uuid
  quantity  Int
  price     Decimal  @db.Decimal(12, 2) // locked price at add time
  createdAt DateTime @default(now()) @db.Timestamp(6)

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])
}
```

#### Order
```prisma
model Order {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId                String      @db.Uuid
  orderNumber           String      @unique
  status                String      @default("pending") // pending, paid, shipped, delivered, cancelled
  items                 OrderItem[]
  subtotal              Decimal     @db.Decimal(12, 2)
  tax                   Decimal     @db.Decimal(12, 2)
  shipping              Decimal     @db.Decimal(12, 2)
  total                 Decimal     @db.Decimal(12, 2)
  shippingAddress       Json
  paymentMethod         String
  stripePaymentIntentId String?
  createdAt             DateTime    @default(now()) @db.Timestamp(6)
  updatedAt             DateTime    @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([status])
}

model OrderItem {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId   String   @db.Uuid
  productId String   @db.Uuid
  name      String   // snapshot at purchase
  price     Decimal  @db.Decimal(12, 2) // snapshot at purchase
  quantity  Int
  image     String   // snapshot at purchase

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])
}
```

#### Review
```prisma
model Review {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  productId String   @db.Uuid
  userId    String   @db.Uuid
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @updatedAt

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([productId, userId]) // one review per user per product
  @@index([productId])
}
```

### Schema Updates to Existing Models

#### Product
```prisma
// Add relations
model Product {
  // ... existing fields ...

  cartItems  CartItem[]
  orderItems OrderItem[]
  reviews    Review[]
}
```

#### User
```prisma
// Add relations
model User {
  // ... existing fields ...

  carts   Cart[]
  orders  Order[]
  reviews Review[]
}
```

---

## API Specification

### Server Actions

#### Authentication Actions (`lib/actions/auth.actions.ts`)
```typescript
signUp(data: SignUpInput): Promise<{ success: boolean; error?: string }>
signIn(data: SignInInput): Promise<{ success: boolean; error?: string }>
signOut(): Promise<void>
resetPassword(email: string): Promise<{ success: boolean }>
updatePassword(token: string, password: string): Promise<{ success: boolean }>
verifyEmail(token: string): Promise<{ success: boolean }>
```

#### Cart Actions (`lib/actions/cart.actions.ts`)
```typescript
getCart(): Promise<Cart | null>
addToCart(productId: string, quantity: number): Promise<Cart>
updateCartItem(itemId: string, quantity: number): Promise<Cart>
removeFromCart(itemId: string): Promise<Cart>
clearCart(): Promise<void>
```

#### Order Actions (`lib/actions/order.actions.ts`)
```typescript
createOrder(data: CreateOrderInput): Promise<Order>
getOrder(orderId: string): Promise<Order | null>
getUserOrders(): Promise<Order[]>
updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>
cancelOrder(orderId: string): Promise<Order>
```

#### Product Actions (`lib/actions/product.actions.ts`)
```typescript
// Existing
getLatestProducts(): Promise<Product[]>
getProductBySlug(slug: string): Promise<Product | null>

// New
getAllProducts(params: ProductQueryParams): Promise<PaginatedProducts>
getFeaturedProducts(): Promise<Product[]>
searchProducts(query: string): Promise<Product[]>
createProduct(data: CreateProductInput): Promise<Product> // admin only
updateProduct(id: string, data: UpdateProductInput): Promise<Product> // admin only
deleteProduct(id: string): Promise<void> // admin only
updateStock(id: string, stock: number): Promise<Product> // admin only
```

#### Review Actions (`lib/actions/review.actions.ts`)
```typescript
createReview(data: CreateReviewInput): Promise<Review>
updateReview(id: string, data: UpdateReviewInput): Promise<Review>
deleteReview(id: string): Promise<void>
getProductReviews(productId: string): Promise<Review[]>
```

#### Admin Actions (`lib/actions/admin.actions.ts`)
```typescript
getDashboardMetrics(): Promise<DashboardMetrics>
getAllOrders(): Promise<Order[]>
getAllUsers(): Promise<User[]>
updateUserRole(userId: string, role: string): Promise<User>
getLowStockProducts(): Promise<Product[]>
```

---

## UI/UX Requirements

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch-friendly buttons (min 44x44px)
- Hamburger menu on mobile

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader labels
- Focus indicators
- Alt text for all images

### Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse score > 90
- Images lazy loaded
- Code splitting per route

### Loading States
- Skeleton loaders for content
- Spinner for actions (add to cart, submit)
- Optimistic UI updates (cart)
- Error boundaries for failures

### Error Handling
- Toast notifications for actions
- Inline form validation errors
- Friendly error messages
- Retry buttons on failures

---

## Non-Functional Requirements

### Security
- HTTPS only in production
- Rate limiting on auth endpoints
- SQL injection prevention (Prisma)
- XSS protection (React escaping)
- CSRF tokens on forms
- Password hashing (bcrypt)
- Session tokens (JWT)

### Performance
- Database query optimization (indexes)
- Image optimization (Next.js Image)
- CDN for static assets
- Response caching where applicable
- Debounced search input

### Scalability
- Serverless-ready (Neon, Vercel)
- Stateless server actions
- Connection pooling (Prisma)
- Background jobs for emails (future)

### Monitoring
- Error tracking (Sentry - future)
- Analytics (Vercel Analytics)
- Performance monitoring (Web Vitals)

### Testing
- Unit tests for utilities
- Integration tests for server actions
- E2E tests for critical flows (checkout)
- Visual regression tests (future)

---

## Feature Priority Matrix

| Feature | Priority | Complexity | Value |
|---------|----------|------------|-------|
| Authentication | P0 | Medium | High |
| Shopping Cart | P0 | Medium | High |
| Checkout & Orders | P0 | High | High |
| Product Search/Filter | P1 | Medium | High |
| Reviews & Ratings | P1 | Low | Medium |
| Admin Dashboard | P1 | Medium | High |
| User Profile | P2 | Low | Medium |
| Product Management | P0 | Medium | High |

**P0**: Must have for MVP
**P1**: Should have for launch
**P2**: Nice to have

---

## Success Metrics

### Business Metrics
- Conversion rate > 2%
- Average order value > $80
- Cart abandonment < 70%
- Customer retention > 30%

### Technical Metrics
- Page load time < 2s
- API response time < 500ms
- Error rate < 0.1%
- Uptime > 99.5%

---

## Appendix

### Glossary
- **SKU**: Stock Keeping Unit (product identifier)
- **JWT**: JSON Web Token (session token)
- **OAuth**: Open Authorization (third-party login)
- **CRUD**: Create, Read, Update, Delete

### References
- Next.js Docs: https://nextjs.org/docs
- Auth.js Docs: https://authjs.dev
- Stripe Docs: https://stripe.com/docs
- Prisma Docs: https://www.prisma.io/docs
