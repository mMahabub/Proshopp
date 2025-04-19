import { APP_NAME } from '@/lib/constants';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Section: Text */}
        <div className="text-center md:text-left">
          <p className="text-lg font-semibold text-gray-100">
            &copy; {currentYear} {APP_NAME}. All Rights Reserved.
          </p>
          <p className="text-sm mt-2 text-gray-400">
            Built with ❤️ by the ProShopp Team.
          </p>
        </div>

        {/* Right Section: Social Icons */}
        <div className="flex justify-center md:justify-end gap-6">
          <a
            href="#"
            className="text-gray-400 hover:text-blue-500 transition-all duration-200"
            aria-label="Facebook"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-sky-400 transition-all duration-200"
            aria-label="Twitter"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-pink-500 transition-all duration-200"
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
