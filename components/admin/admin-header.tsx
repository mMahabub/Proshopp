'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOutUser } from '@/lib/actions/auth.actions'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', href: '/admin/users', icon: Users },
]

export default function AdminHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOutUser()
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white lg:hidden">
      <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6">
        {/* Mobile menu button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 bg-gray-900 p-0">
            <div className="flex h-full flex-col gap-y-5 px-6 pb-4">
              {/* Logo and Admin Badge */}
              <div className="flex h-16 shrink-0 items-center gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
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
                              onClick={() => setOpen(false)}
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
          </SheetContent>
        </Sheet>

        {/* Logo for mobile */}
        <div className="flex flex-1 items-center gap-2">
          <Link href="/admin" className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg font-bold">Proshopp</span>
          </Link>
          <Badge variant="secondary" className="ml-2">
            Admin
          </Badge>
        </div>
      </div>
    </header>
  )
}
