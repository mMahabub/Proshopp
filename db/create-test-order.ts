import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()

  // Get the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  })

  if (!adminUser) {
    console.error('Admin user not found')
    return
  }

  // Get the first product
  const product = await prisma.product.findFirst()

  if (!product) {
    console.error('No products found')
    return
  }

  // Create a test order
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      userId: adminUser.id,
      status: 'pending',
      subtotal: 59.99,
      tax: 5.99,
      shippingCost: 0,
      totalPrice: 65.98,
      shippingAddress: {
        fullName: 'John Doe',
        streetAddress: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
      },
      paymentMethod: 'stripe',
      paymentResult: {
        paymentIntentId: 'pi_test_123456',
      },
      isPaid: true,
      paidAt: new Date(),
      items: {
        create: [
          {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: product.images[0],
            price: 59.99,
            quantity: 1,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  })

  console.log('Test order created:', order.orderNumber)
  console.log('Order ID:', order.id)

  await prisma.$disconnect()
}

main()
