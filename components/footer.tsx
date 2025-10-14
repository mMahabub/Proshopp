import { APP_NAME } from '@/lib/constants';
import { Facebook, Twitter, Instagram, Linkedin, Github, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative border-t-2 border-[#88BDBC]/30 bg-[#112D32] mt-24">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#254E58]/10 via-[#88BDBC]/5 to-[#254E58]/10 pointer-events-none" />

      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#254E58] via-[#88BDBC] to-[#254E58]" />

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#88BDBC]">
              {APP_NAME}
            </h3>
            <p className="text-sm text-[#88BDBC]/80 leading-relaxed">
              Your trusted destination for premium products at unbeatable prices. Quality and customer satisfaction guaranteed.
            </p>
            <div className="space-y-2 text-sm text-[#88BDBC]/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@proshopp.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>123 Commerce St, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-[#88BDBC]">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/search" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-[#88BDBC]">Customer Service</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shipping" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-[#88BDBC]/80 hover:text-[#88BDBC] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-[#88BDBC]">Connect With Us</h4>
            <p className="text-sm text-[#88BDBC]/80">
              Follow us on social media for updates, deals, and more.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <a
                href="#"
                className="group relative p-3 rounded-lg border border-[#88BDBC]/20 bg-[#88BDBC]/5 hover:border-[#254E58]/50 hover:bg-[#254E58]/10 transition-all duration-300 hover:shadow-medium flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-[#88BDBC] group-hover:text-[#254E58] transition-colors" />
              </a>
              <a
                href="#"
                className="group relative p-3 rounded-lg border border-[#88BDBC]/20 bg-[#88BDBC]/5 hover:border-[#254E58]/50 hover:bg-[#254E58]/10 transition-all duration-300 hover:shadow-medium flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-[#88BDBC] group-hover:text-[#254E58] transition-colors" />
              </a>
              <a
                href="#"
                className="group relative p-3 rounded-lg border border-[#88BDBC]/20 bg-[#88BDBC]/5 hover:border-[#254E58]/50 hover:bg-[#254E58]/10 transition-all duration-300 hover:shadow-medium flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-[#88BDBC] group-hover:text-[#254E58] transition-colors" />
              </a>
              <a
                href="#"
                className="group relative p-3 rounded-lg border border-[#88BDBC]/20 bg-[#88BDBC]/5 hover:border-[#254E58]/50 hover:bg-[#254E58]/10 transition-all duration-300 hover:shadow-medium flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-[#88BDBC] group-hover:text-[#254E58] transition-colors" />
              </a>
              <a
                href="#"
                className="group relative p-3 rounded-lg border border-[#88BDBC]/20 bg-[#88BDBC]/5 hover:border-[#254E58]/50 hover:bg-[#254E58]/10 transition-all duration-300 hover:shadow-medium flex items-center justify-center"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-[#88BDBC] group-hover:text-[#254E58] transition-colors" />
              </a>
              <a
                href="#"
                className="group relative p-3 rounded-lg border border-[#88BDBC]/20 bg-[#88BDBC]/5 hover:border-destructive/50 hover:bg-destructive/10 transition-all duration-300 hover:shadow-medium flex items-center justify-center"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-[#88BDBC] group-hover:text-destructive transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-[#88BDBC]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#88BDBC]/80 text-center md:text-left">
              &copy; {currentYear} {APP_NAME}. All Rights Reserved. Built with passion by the ProShopp Team.
            </p>
            <div className="flex gap-6 text-sm text-[#88BDBC]/80">
              <Link href="/privacy" className="hover:text-[#88BDBC] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#88BDBC] transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-[#88BDBC] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
