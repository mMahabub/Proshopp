import { Button } from '@/components/ui/button';
import MoodToggle from './mode-toggle';
import { EllipsisVertical, ShoppingCart, UserIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Menu = () => {
  return (
    <div className="flex justify-end gap-4 p-4 bg-gray-100 rounded-lg">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex w-full max-w-sm gap-3 items-center">
        <MoodToggle />
        <Button
          asChild
          variant="ghost"
          className="flex items-center gap-2 hover:bg-gray-200 transition-all duration-200 rounded-lg px-3 py-2"
        >
          <Link href="/cart">
            <ShoppingCart className="w-5 h-5" /> <span>Cart</span>
          </Link>
        </Button>
        <Button
          asChild
          className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-400 transition-all duration-200 rounded-lg px-3 py-2"
        >
          <Link href="/sign-in">
            <UserIcon className="w-5 h-5" /> <span>Sign In</span>
          </Link>
        </Button>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle hover:bg-gray-200 transition-all duration-200 rounded-full p-2">
            <EllipsisVertical className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start gap-4 p-4 bg-white rounded-lg">
            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            <MoodToggle />
            <Button
              asChild
              variant="ghost"
              className="flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 rounded-lg px-3 py-2 w-full"
            >
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" /> <span>Cart</span>
              </Link>
            </Button>
            <Button
              asChild
              className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-400 transition-all duration-200 rounded-lg px-3 py-2 w-full"
            >
              <Link href="/sign-in">
                <UserIcon className="w-5 h-5" /> <span>Sign In</span>
              </Link>
            </Button>
            <SheetDescription className="text-sm text-gray-500">
              Explore more options in the menu.
            </SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
