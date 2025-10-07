
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";


const Header = () => {
    return (
         <header className="w-full border-b border-border/40 bg-gradient-to-r from-background via-background to-muted/30 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
        <div className="wrapper flex-between py-4">
            <div className="flex-start">
                <Link href='/' className="flex-start gap-3 group">
                <div className="relative">
                  <Image
                    src='/images/logo.svg'
                    alt={`${APP_NAME} logo `}
                    height={48}
                    width={48}
                    priority={true}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="hidden lg:block font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
                </Link>
            </div>
            <Menu/>
        </div>

    </header>
    );
}

export default Header;