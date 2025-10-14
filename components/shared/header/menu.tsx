import { Button } from '@/components/ui/button'
import MoodToggle from './mode-toggle'
import UserButton from './user-button'
import CartIcon from './cart-icon'
import { auth } from '@/auth'
import {
  EllipsisVertical,
  UserIcon,
  User,
  Package,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { signOutUser } from '@/lib/actions/auth.actions'

const Menu = async () => {
  const session = await auth()

  return (
    <div className="flex justify-end gap-4 p-4">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex w-full max-w-sm gap-3 items-center">
        <MoodToggle />
        <CartIcon />
        {session?.user ? (
          <UserButton user={session.user} />
        ) : (
          <Button
            asChild
            className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 transition-all duration-200 rounded-lg px-3 py-2"
          >
            <Link href="/sign-in">
              <UserIcon className="w-5 h-5" /> <span>Sign In</span>
            </Link>
          </Button>
        )}
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle hover:bg-[#88BDBC]/20 transition-all duration-200 rounded-full p-2 text-[#88BDBC]">
            <EllipsisVertical className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start gap-4 p-4 bg-white rounded-lg">
            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            <MoodToggle />
            <CartIcon className="w-full hover:bg-gray-100" />

            {session?.user ? (
              <>
                {/* User Info */}
                <div className="w-full px-3 py-2 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        session.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Menu Items */}
                <Button
                  asChild
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 rounded-lg px-3 py-2 w-full"
                >
                  <Link href="/profile">
                    <User className="w-5 h-5" /> <span>Profile</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 rounded-lg px-3 py-2 w-full"
                >
                  <Link href="/orders">
                    <Package className="w-5 h-5" /> <span>Orders</span>
                  </Link>
                </Button>

                {/* Admin Panel Link (only for admins) */}
                {session.user.role === 'admin' && (
                  <Button
                    asChild
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 rounded-lg px-3 py-2 w-full border-t border-gray-200"
                  >
                    <Link href="/admin">
                      <ShieldCheck className="w-5 h-5" /> <span>Admin Panel</span>
                    </Link>
                  </Button>
                )}

                {/* Sign Out */}
                <form action={signOutUser} className="w-full">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 rounded-lg px-3 py-2 w-full border-t border-gray-200 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-5 h-5" /> <span>Sign Out</span>
                  </Button>
                </form>
              </>
            ) : (
              <Button
                asChild
                className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-400 transition-all duration-200 rounded-lg px-3 py-2 w-full"
              >
                <Link href="/sign-in">
                  <UserIcon className="w-5 h-5" /> <span>Sign In</span>
                </Link>
              </Button>
            )}

            <SheetDescription className="text-sm text-gray-500">
              Explore more options in the menu.
            </SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}

export default Menu
