'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  Menu,
  Home,
  Search,
  ShoppingCart,
  Package,
  User,
  LogIn,
  UserPlus,
  Info,
  Mail,
  HelpCircle,
  FileText,
  Truck,
  RefreshCw,
  Shield,
  ScrollText,
  LayoutDashboard,
  Users,
} from 'lucide-react'

interface NavigationLink {
  href: string
  label: string
  icon: React.ElementType
  requiresAuth?: boolean
  requiresAdmin?: boolean
}

interface NavigationDrawerProps {
  user?: {
    name: string
    email: string
    role: string
  } | null
}

export default function NavigationDrawer({ user }: NavigationDrawerProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const shopLinks: NavigationLink[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search Products', icon: Search },
    { href: '/cart', label: 'Shopping Cart', icon: ShoppingCart },
    { href: '/orders', label: 'My Orders', icon: Package, requiresAuth: true },
  ]

  const accountLinks: NavigationLink[] = user
    ? [
        { href: '/profile', label: 'Profile', icon: User, requiresAuth: true },
      ]
    : [
        { href: '/sign-in', label: 'Sign In', icon: LogIn },
        { href: '/sign-up', label: 'Sign Up', icon: UserPlus },
      ]

  const infoLinks: NavigationLink[] = [
    { href: '/about', label: 'About Us', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
    { href: '/blog', label: 'Blog', icon: FileText },
    { href: '/shipping', label: 'Shipping Info', icon: Truck },
    { href: '/returns', label: 'Returns', icon: RefreshCw },
    { href: '/privacy', label: 'Privacy Policy', icon: Shield },
    { href: '/terms', label: 'Terms of Service', icon: ScrollText },
  ]

  const adminLinks: NavigationLink[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, requiresAdmin: true },
    { href: '/admin/products', label: 'Products', icon: Package, requiresAdmin: true },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, requiresAdmin: true },
    { href: '/admin/users', label: 'Users', icon: Users, requiresAdmin: true },
  ]

  const renderLinks = (links: NavigationLink[], title: string) => {
    const filteredLinks = links.filter((link) => {
      if (link.requiresAdmin && user?.role !== 'admin') return false
      if (link.requiresAuth && !user) return false
      return true
    })

    if (filteredLinks.length === 0) return null

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {filteredLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#1e2936] text-white'
                    : 'text-gray-200 hover:bg-[#1e2936]/50 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto bg-[#2c3e50] text-white">
        <SheetHeader>
          <SheetTitle className="text-left">Navigation</SheetTitle>
          {user && (
            <div className="text-left pt-2 pb-4 border-b">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-[#1e2936] text-white rounded">
                  Admin
                </span>
              )}
            </div>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {renderLinks(shopLinks, 'Shop')}
          {renderLinks(accountLinks, 'Account')}
          {renderLinks(infoLinks, 'Information')}
          {user?.role === 'admin' && renderLinks(adminLinks, 'Admin Panel')}
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-400 text-center">
            © 2025 Proshopp. All rights reserved.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
