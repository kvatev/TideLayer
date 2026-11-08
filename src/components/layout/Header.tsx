import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { LinkButton } from '../ui/Button';
import { brandConfig } from '../../config/brand';
import { useSiteControl } from '../../data/siteControl';

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
  const location = useLocation();
  const [dropdownState, setDropdownState] = useState<{ path: string; key: string | null }>({
    path: location.pathname,
    key: null,
  });
  const dropdownOpen = dropdownState.path === location.pathname ? dropdownState.key : null;
  const setDropdownOpen = (key: string | null) =>
    setDropdownState({ path: location.pathname, key });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siteControl = useSiteControl();
  const hiddenSet = new Set(siteControl.hiddenNavHrefs);

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDropdownOpen(key);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDropdownState({ path: location.pathname, key: null });
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setDropdownState((prev) => ({ ...prev, key: null }));
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

  const mainNav = (brandConfig.navigation.main as readonly NavItem[]).filter(
    (item) => !hiddenSet.has(item.href)
  );
  const dropdowns = {
    'web-solutions': brandConfig.navigation.webSolutionsDropdown.filter((i) => !hiddenSet.has(i.href)),
    'education-solutions': brandConfig.navigation.educationSolutionsDropdown.filter((i) => !hiddenSet.has(i.href)),
    'networks-it': brandConfig.navigation.networksItDropdown.filter((i) => !hiddenSet.has(i.href)),
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white',
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'border-b border-transparent'
      )}
      role="banner"
    >
      <nav className="container" aria-label="Главна навигация">
        <div className="flex h-16 lg:h-18 items-center justify-between gap-2 xl:gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 focus-visible:outline-none"
            aria-label={`${brandConfig.name} - Начало`}
          >
            {/* Desktop & Tablet: Logo with text */}
            <img
              src="/images/logo/logo.webp"
              alt={brandConfig.name}
              className="hidden sm:block h-10 lg:h-11 w-auto object-contain"
            />
            {/* Mobile: Logo icon only */}
            <img
              src="/images/logo/icon.webp"
              alt={brandConfig.name}
              className="sm:hidden h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation (from lg: 1024px so 768px tablets never wrap/overflow) */}
          <div className="hidden lg:flex lg:items-center lg:gap-0.5 xl:gap-1">
            {mainNav.map((item) => {
              const dropdownKey = item.href.replace('/', '') as keyof typeof dropdowns;
              const dropdownItems = item.hasDropdown ? (dropdowns[dropdownKey] ?? []) : [];
              const isDropdown = Boolean(item.hasDropdown && dropdownItems.length > 0);
              const isActive = location.pathname === item.href || (item.hasDropdown && location.pathname.startsWith(item.href));

              if (isDropdown) {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.href)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={cn(
                        'flex items-center gap-1 px-2.5 xl:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap',
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-700 hover:text-navy-900 hover:bg-slate-50'
                      )}
                      aria-expanded={dropdownOpen === item.href}
                      aria-haspopup="true"
                      onKeyDown={(e) => handleKeyDown(e, item.href)}
                      onClick={(e) => { e.stopPropagation(); setDropdownOpen(dropdownOpen === item.href ? null : item.href); }}
                    >
                      {item.label}
                      <Icon
                        name="ChevronDown"
                        size={15}
                        className={cn('transition-transform duration-200', dropdownOpen === item.href && 'rotate-180')}
                      />
                    </button>

                    {dropdownOpen === item.href && (
                      <div className="absolute left-0 top-full pt-1.5 w-60 z-50">
                        <div className="origin-top-left animate-scale-in rounded-xl bg-white border border-slate-200 shadow-lg py-2">
                          <Link
                            to={item.href}
                            onClick={() => setDropdownOpen(null)}
                            className="block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-600 hover:bg-blue-50/70 transition-colors border-b border-slate-100 mb-1"
                          >
                            Всички в {item.label}
                          </Link>
                          {dropdownItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              to={subItem.href}
                              onClick={() => setDropdownOpen(null)}
                              className="block px-4 py-2.5 text-sm text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
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
                    className="ml-2 whitespace-nowrap"
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
                    'px-2.5 xl:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-slate-50'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile & Tablet Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-navy-900 hover:bg-slate-100 transition-colors shrink-0"
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
