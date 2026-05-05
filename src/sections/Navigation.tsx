import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import SilverJubileeLogo from '../components/SilverJubileeLogo';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Competitions', href: '#competitions' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Register', href: '#register' },
  { label: 'Login', href: '#login' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#080614]/90 backdrop-blur-md py-2 border-b border-[#C9A84C]/30' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="w-full px-[4vw] flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#" 
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <SilverJubileeLogo size={48} />
            <div className="hidden sm:flex items-center gap-2">
              <img src="/ahlaad.png" alt="Ahlaad" className="h-7 w-auto object-contain" style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.9)) drop-shadow(0 0 16px rgba(201,168,76,0.5))' }} />
              <span className="font-display text-xl md:text-2xl text-[#C9A84C] tracking-wider">2K26</span>
            </div>
            <span className="text-[10px] text-white/50 font-mono tracking-wider block sm:hidden">AHLAAD 2K26</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="text-sm text-white/80 hover:text-[#C9A84C] transition-colors font-medium tracking-wide"
              >
                {link.label}
              </button>
            ))}
            <button 
              onClick={() => scrollToSection('#register')}
              className="btn-primary text-sm py-2 px-6"
            >
              Register Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 bg-[#080614]/98 backdrop-blur-lg transition-all duration-500 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <SilverJubileeLogo size={80} />
          {navLinks.map((link, index) => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.href)}
              className="font-display text-3xl text-white hover:text-[#C9A84C] transition-colors"
              style={{ 
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                opacity: isMobileMenuOpen ? 1 : 0,
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              {link.label}
            </button>
          ))}
          <button 
            className="btn-primary mt-4"
            style={{ 
              transitionDelay: isMobileMenuOpen ? '250ms' : '0ms',
              opacity: isMobileMenuOpen ? 1 : 0,
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)'
            }}
            onClick={() => scrollToSection('#register')}
          >
            Register Now
          </button>
        </div>
      </div>
    </>
  );
}
