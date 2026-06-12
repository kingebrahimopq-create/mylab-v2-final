import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Why Command', href: '#comparison' },
  { label: 'Ecosystem', href: '#ecosystem' },
  { label: 'Reviews', href: '#reviews' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: '72px',
        background: scrolled ? 'rgba(0,42,84,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="text-lg font-extrabold tracking-tight" style={{ color: '#F5F6F8', fontSize: '18px' }}>
          KW: Command
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="relative text-sm font-semibold transition-colors duration-300 group"
              style={{ color: '#A8D0E6', letterSpacing: '0.02em' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00A9E0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A8D0E6')}
            >
              {link.label}
              <span
                className="absolute left-0 bottom-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-300"
                style={{ backgroundColor: '#00A9E0' }}
              />
              <style>{`
                .group:hover span {
                  transform: scaleX(1) !important;
                }
              `}</style>
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <button
            className="font-semibold transition-all duration-300"
            style={{
              backgroundColor: '#00A9E0',
              color: '#002A54',
              borderRadius: '32px',
              padding: '10px 24px',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,169,224,0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Download the App
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: '#F5F6F8' }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 p-6 flex flex-col gap-4"
          style={{ background: 'rgba(0,42,84,0.95)', backdropFilter: 'blur(16px)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-base font-semibold"
              style={{ color: '#A8D0E6' }}
            >
              {link.label}
            </a>
          ))}
          <button
            className="font-semibold mt-2 w-full"
            style={{
              backgroundColor: '#00A9E0',
              color: '#002A54',
              borderRadius: '32px',
              padding: '12px 24px',
              fontSize: '14px',
            }}
          >
            Download the App
          </button>
        </div>
      )}
    </header>
  );
}
