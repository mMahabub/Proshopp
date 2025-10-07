
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";


const Header = () => {
    return (
         <header className="w-full border-b-2 border-primary/10 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:bg-card backdrop-blur-lg sticky top-0 z-50 shadow-[0_2px_20px_rgba(99,102,241,0.08)]">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 pointer-events-none" />

        {/* Decorative gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent" />

        <div className="wrapper flex-between py-5 relative z-10">
            <div className="flex-start">
                <Link href='/' className="flex-start gap-3 group">
                <div className="relative">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-full" />
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
                  <span className="font-bold text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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