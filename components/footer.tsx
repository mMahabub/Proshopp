import { APP_NAME } from '@/lib/constants';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background to-muted/20 mt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Left Section: Brand & Copyright */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {APP_NAME}
            </h3>
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} {APP_NAME}. All Rights Reserved.
            </p>
            <p className="text-xs mt-1 text-muted-foreground/80">
              Built with passion by the ProShopp Team
            </p>
          </div>

          {/* Right Section: Social Icons */}
          <div className="flex justify-center md:justify-end gap-4">
            <a
              href="#"
              className="group relative p-3 rounded-lg border border-border/40 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-medium"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
            <a
              href="#"
              className="group relative p-3 rounded-lg border border-border/40 bg-card hover:border-accent/50 transition-all duration-300 hover:shadow-medium"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </a>
            <a
              href="#"
              className="group relative p-3 rounded-lg border border-border/40 bg-card hover:border-secondary/50 transition-all duration-300 hover:shadow-medium"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
