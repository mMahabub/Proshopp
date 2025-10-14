
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";
import NavigationDrawer from "../navigation-drawer";
import { auth } from "@/auth";


const Header = async () => {
    const session = await auth();

    return (
         <header className="w-full border-b-2 border-white/10 bg-[#1c404e] backdrop-blur-lg sticky top-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c5b82]/10 via-[#0c5b82]/5 to-[#0c5b82]/10 pointer-events-none" />

        {/* Decorative gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0c5b82] via-[#2d373d] to-[#0c5b82]" />

        <div className="wrapper flex-between py-5 relative z-10">
            <div className="flex-start gap-3">
                {/* Navigation Drawer - Left side */}
                <NavigationDrawer user={session?.user || null} />

                <Link href='/' className="flex-start gap-3 group">
                <div className="relative">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300 rounded-full" />
                  <Image
                    src='/images/logo.svg'
                    alt={`${APP_NAME} logo `}
                    height={48}
                    width={48}
                    priority={true}
                    className="relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  />
                </div>
                <div className="hidden lg:block">
                  <span className="font-bold text-2xl text-white">
                    {APP_NAME}
                  </span>
                  <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full" />
                </div>
                </Link>
            </div>
            <Menu/>
        </div>

    </header>
    );
}

export default Header;