import { useState, useEffect } from 'react';
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

interface HeaderProps {
  onMenuOpen: () => void;
}

export function Header({ onMenuOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setDropdownOpen(null);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setDropdownOpen(null);
    if (dropdownOpen) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [dropdownOpen]);

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
            className="flex items-center shrink-0 focus-visible:outline-none"
            aria-label={`${brandConfig.name} - Начало`}
          >
            {/* Desktop & Tablet: Logo with text (и двете) */}
            <img
              src="/images/logo/logo.webp"
              alt={brandConfig.name}
              className="hidden sm:block h-9 md:h-10 w-auto object-contain"
            />
            {/* Mobile: Logo icon only (само логото) */}
            <img
              src="/images/logo/icon.webp"
              alt={brandConfig.name}
              className="sm:hidden h-8 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {mainNav.map((item) => {
              const dropdownKey = item.href.replace('/', '') as keyof typeof dropdowns;
              const isDropdown = item.hasDropdown && dropdowns[dropdownKey];
              const isActive = location.pathname === item.href || (item.hasDropdown && location.pathname.startsWith(item.href));

              if (isDropdown) {
                const dropdownItems = dropdowns[dropdownKey];
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
                          : scrolled
                            ? 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                            : 'text-navy-900 hover:text-blue-600 hover:bg-white/10'
                      )}
                      aria-expanded={dropdownOpen === item.href}
                      aria-haspopup="true"
                      onKeyDown={(e) => handleKeyDown(e, item.href)}
                      onClick={(e) => { e.stopPropagation(); setDropdownOpen(dropdownOpen === item.href ? null : item.href); }}
                    >
                      {item.label}
                      <Icon
                        name="ChevronDown"
                        size={16}
                        className={cn('transition-transform duration-200', dropdownOpen === item.href && 'rotate-180')}
                      />
                    </button>

                    {dropdownOpen === item.href && (
                      <div className="absolute left-0 top-full mt-2 w-56 origin-top-left animate-scale-in rounded-xl bg-white border border-slate-200 shadow-lg py-2 z-50">
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
                    href={item.href}
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
                      : scrolled
                        ? 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                        : 'text-navy-900 hover:text-blue-600 hover:bg-white/10'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-navy-900 hover:bg-white/10'
            )}
            onClick={onMenuOpen}
            aria-label="Отвори меню"
            aria-controls="mobile-menu"
          >
            <Icon name="Menu" size={24} />
          </button>
        </div>
      </nav>
    </header>
  );
}
