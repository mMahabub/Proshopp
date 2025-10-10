import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      }
    })

    if (users.length === 0) {
      console.log('❌ No users found in database')
      console.log('\nPlease sign in using Google or GitHub first, then run this script again.')
      return
    }

    console.log(`\n📋 Found ${users.length} user(s) in database:\n`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`)
      console.log('')
    })

    const adminUsers = users.filter(u => u.role === 'admin')
    if (adminUsers.length > 0) {
      console.log(`✅ ${adminUsers.length} admin user(s) found`)
    } else {
      console.log('ℹ️  No admin users found. Use make-admin.ts to promote a user.')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
