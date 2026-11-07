import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { LinkButton } from '../ui/Button';
import { brandConfig } from '../../config/brand';

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  isCTA?: boolean;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(null);
  }, [location.pathname]);

  const handleKeyDown = (e: React.KeyboardEvent, itemKey: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setDropdownOpen(dropdownOpen === itemKey ? null : itemKey);
    } else if (e.key === 'Escape') {
      setDropdownOpen(null);
    }
  };

  const mainNav = [...brandConfig.navigation.main] as NavItem[];
  const dropdowns = {
    'web-solutions': brandConfig.navigation.webSolutionsDropdown,
    'education-solutions': brandConfig.navigation.educationSolutionsDropdown,
    'networks-it': brandConfig.navigation.networksItDropdown
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      )}
      role="banner"
    >
      <nav className="container" aria-label="Главна навигация">
        <div className="flex h-16 md:h-18 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-navy-900 font-heading font-bold text-xl md:text-2xl shrink-0"
            aria-label={`${brandConfig.name} - Начало`}
          >
            <img
              src="/images/logo/icon.webp"
              alt=""
              className="h-9 w-auto md:h-10"
              aria-hidden="true"
            />
            <span className="hidden sm:block">{brandConfig.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {mainNav.map((item) => {
              const isDropdown = item.hasDropdown && dropdowns[item.href.replace('/', '') as keyof typeof dropdowns];
              const isActive = location.pathname === item.href || (item.hasDropdown && location.pathname.startsWith(item.href));

              if (isDropdown) {
                const dropdownItems = dropdowns[item.href.replace('/', '') as keyof typeof dropdowns];
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(item.href)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    <button
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                      )}
                      aria-expanded={dropdownOpen === item.href}
                      aria-haspopup="true"
                      onKeyDown={(e) => handleKeyDown(e, item.href)}
                    >
                      {item.label}
                      <Icon name="ChevronDown" size={16} className="transition-transform duration-200" />
                    </button>

                    {dropdownOpen === item.href && (
                      <div className="absolute left-0 top-full mt-2 w-56 origin-top-right animate-scale-in rounded-xl bg-white border border-slate-200 shadow-lg py-2 z-50">
                        {dropdownItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            className="block px-4 py-2.5 text-sm text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.isCTA) {
                return (
                  <LinkButton
                    key={item.href}
                    to={item.href}
                    variant="primary"
                    size="sm"
                    className="ml-2"
                  >
                    {item.label}
                  </LinkButton>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Отвори меню"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <Icon name="Menu" size={24} />
          </button>
        </div>
      </nav>
    </header>
  );
}