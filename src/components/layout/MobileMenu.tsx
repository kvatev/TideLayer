import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { brandConfig } from '../../config/brand';

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  isCTA?: boolean;
}

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setDropdownOpen(null);
    if (isOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Focus close button when menu opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const mainNav = [...brandConfig.navigation.main] as NavItem[];
  const dropdowns = {
    'web-solutions': brandConfig.navigation.webSolutionsDropdown,
    'education-solutions': brandConfig.navigation.educationSolutionsDropdown,
    'networks-it': brandConfig.navigation.networksItDropdown
  };

  if (!isOpen) return null;

  return (
    <div
      id="mobile-menu"
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 shrink-0">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center focus-visible:outline-none"
            aria-label={`${brandConfig.name} - Начало`}
          >
            <img
              src="/images/logo/logo.webp"
              alt={brandConfig.name}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Затвори меню"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Мобилна навигация">
          {mainNav.map((item) => {
            const dropdownKey = item.href.replace('/', '') as keyof typeof dropdowns;
            const isDropdown = item.hasDropdown && dropdowns[dropdownKey];
            const isActive = location.pathname === item.href || (item.hasDropdown && location.pathname.startsWith(item.href));

            if (item.isCTA) {
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold text-base mt-2 hover:bg-blue-700 transition-colors"
                >
                  {item.label}
                </Link>
              );
            }

            if (isDropdown) {
              const dropdownItems = dropdowns[dropdownKey];
              return (
                <div key={item.href} className="space-y-1">
                  <button
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl transition-colors',
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-700 hover:text-navy-900 hover:bg-slate-50'
                    )}
                    onClick={() => setDropdownOpen(dropdownOpen === item.href ? null : item.href)}
                    aria-expanded={dropdownOpen === item.href}
                  >
                    {item.label}
                    <Icon
                      name="ChevronDown"
                      size={20}
                      className={cn('transition-transform duration-200 text-slate-400', dropdownOpen === item.href && 'rotate-180')}
                    />
                  </button>

                  {dropdownOpen === item.href && (
                    <div className="pl-4 space-y-1 animate-slide-down">
                      {dropdownItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          onClick={onClose}
                          className="block px-4 py-2.5 text-sm text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'block px-4 py-3 text-base font-medium rounded-xl transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-700 hover:text-navy-900 hover:bg-slate-50'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-slate-200 space-y-3">
          <address className="not-italic text-sm text-slate-600 space-y-1">
            <p className="font-medium text-navy-900">{brandConfig.contact.address.full}</p>
            <p>
              <a href={`mailto:${brandConfig.contact.email}`} className="text-blue-600 hover:text-blue-700">
                {brandConfig.contact.email}
              </a>
            </p>
            <p>
              <a href={`tel:${brandConfig.contact.phone}`} className="text-blue-600 hover:text-blue-700">
                {brandConfig.contact.phone}
              </a>
            </p>
          </address>
        </div>
      </div>
    </div>
  );
}
