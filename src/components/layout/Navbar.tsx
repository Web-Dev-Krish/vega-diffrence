import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: "Malhotra Catering's", path: '/catering' },
  { name: 'Signature Events', path: '/signature-events' },
  { name: 'Blogs', path: '/blogs' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0B0B0B]/95 backdrop-blur-md py-4 shadow-lg shadow-black/50' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif font-bold text-white tracking-wider flex items-center gap-2">
          <span className="text-[#D4AF37]">M</span>
          <span className="hidden sm:inline">ALHOTRA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm tracking-wide transition-colors hover:text-[#D4AF37] ${
                location.pathname === link.path ? 'text-[#D4AF37]' : 'text-gray-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/contact"
            className="px-6 py-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 uppercase tracking-widest text-xs font-semibold"
          >
            Book Now
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[#0B0B0B] border-t border-white/10 py-4 px-4 flex flex-col gap-4 lg:hidden shadow-2xl"
          >
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-lg transition-colors hover:text-[#D4AF37] ${
                  location.pathname === link.path ? 'text-[#D4AF37]' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="mt-4 px-6 py-3 bg-[#D4AF37] text-black text-center font-bold uppercase tracking-wider"
            >
              Book Now
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
