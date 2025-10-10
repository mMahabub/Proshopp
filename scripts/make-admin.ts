import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  try {
    // Get the user's email from command line argument
    const email = process.argv[2]

    if (!email) {
      console.log('Usage: npx tsx scripts/make-admin.ts <email>')
      console.log('Example: npx tsx scripts/make-admin.ts your-google-email@gmail.com')
      process.exit(1)
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      console.log('\nPlease sign in first using Google or GitHub, then run this script again.')
      process.exit(1)
    }

    // Update user to admin
    await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    })

    console.log(`✅ Successfully updated ${email} to admin role!`)
    console.log('\nYou can now access admin pages at http://localhost:3000/admin')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
