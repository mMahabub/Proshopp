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
    <div className="flex h-full flex-col gap-y-5 bg-gradient-to-b from-card to-muted/20 border-r border-border/40 px-6 pb-4">
      {/* Logo and Admin Badge */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 -mx-6 px-6">
        <Link href="/admin" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Proshopp
          </span>
        </Link>
        <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          Admin
        </Badge>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1.5">
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
                          ? 'bg-gradient-to-r from-primary/10 to-secondary/5 text-primary border-l-2 border-primary shadow-soft'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent',
                        'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-all duration-200'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* Logout Button */}
          <li className="mt-auto border-t border-border/40 pt-4">
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-x-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                Logout
              </Button>
            </form>
          </li>
        </ul>
      </nav>
    </div>
  )
}
