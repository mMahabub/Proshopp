'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
} from 'lucide-react'
import { signOutUser } from '@/lib/actions/auth.actions'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', href: '/admin/users', icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOutUser()
  }

  return (
    <div className="flex h-full flex-col gap-y-5 bg-gray-900 px-6 pb-4">
      {/* Logo and Admin Badge */}
      <div className="flex h-16 shrink-0 items-center gap-2">
        <Link href="/admin" className="flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">Proshopp</span>
        </Link>
        <Badge variant="secondary" className="ml-auto">
          Admin
        </Badge>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href)

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                      )}
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* Logout Button */}
          <li className="mt-auto">
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-x-3 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                Logout
              </Button>
            </form>
          </li>
        </ul>
      </nav>
    </div>
  )
}
