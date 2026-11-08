import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { brandConfig } from '../../config/brand';
import { useSiteControl } from '../../data/siteControl';

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
  const siteControl = useSiteControl();
  const hiddenSet = new Set(siteControl.hiddenNavHrefs);

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

  const mainNav = (brandConfig.navigation.main as readonly NavItem[]).filter(
    (item) => !hiddenSet.has(item.href)
  );
  const dropdowns = {
    'web-solutions': brandConfig.navigation.webSolutionsDropdown.filter((i) => !hiddenSet.has(i.href)),
    'education-solutions': brandConfig.navigation.educationSolutionsDropdown.filter((i) => !hiddenSet.has(i.href)),
    'networks-it': brandConfig.navigation.networksItDropdown.filter((i) => !hiddenSet.has(i.href)),
  };

  if (!isOpen) return null;

  return (
    <div
      id="mobile-menu"
      className="fixed inset-0 z-50 lg:hidden overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — strictly capped inside 100vw so buttons never clip */}
      <div className="absolute right-0 top-0 bottom-0 w-[min(20rem,100vw)] bg-white shadow-2xl flex flex-col animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="flex h-16 items-center justify-between gap-3 px-4 border-b border-slate-200 shrink-0 min-w-0">
          <span id="mobile-menu-title" className="sr-only">Мобилно меню</span>
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center min-w-0 focus-visible:outline-none"
            aria-label={`${brandConfig.name} - Начало`}
          >
            <img
              src="/images/logo/logo.webp"
              alt={brandConfig.name}
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 -mr-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Затвори меню"
          >
            <Icon name="X" size={22} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1" aria-label="Мобилна навигация">
          {mainNav.map((item) => {
            const dropdownKey = item.href.replace('/', '') as keyof typeof dropdowns;
            const dropdownItems = item.hasDropdown ? (dropdowns[dropdownKey] ?? []) : [];
            const isDropdown = Boolean(item.hasDropdown && dropdownItems.length > 0);
            const isActive = location.pathname === item.href || (item.hasDropdown && location.pathname.startsWith(item.href));

            if (item.isCTA) {
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold text-base mt-3 hover:bg-blue-700 transition-colors"
                >
                  {item.label}
                </Link>
              );
            }

            if (isDropdown) {
              return (
                <div key={item.href} className="space-y-1">
                  <button
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-4 py-3 text-base font-medium rounded-xl transition-colors text-left',
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-700 hover:text-navy-900 hover:bg-slate-50'
                    )}
                    onClick={() => setDropdownOpen(dropdownOpen === item.href ? null : item.href)}
                    aria-expanded={dropdownOpen === item.href}
                  >
                    <span className="truncate">{item.label}</span>
                    <Icon
                      name="ChevronDown"
                      size={20}
                      className={cn('shrink-0 transition-transform duration-200 text-slate-400', dropdownOpen === item.href && 'rotate-180')}
                    />
                  </button>

                  {dropdownOpen === item.href && (
                    <div className="pl-4 space-y-1 animate-slide-down">
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="block px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        Всички в {item.label}
                      </Link>
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
                  'block px-4 py-3 text-base font-medium rounded-xl transition-colors truncate',
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
        <div className="shrink-0 p-4 border-t border-slate-200 bg-slate-50/70">
          <address className="not-italic text-sm text-slate-600 space-y-1 break-words">
            {siteControl.contactInfo.addressFull && (
              <p className="font-medium text-navy-900 mb-1">{siteControl.contactInfo.addressFull}</p>
            )}
            {siteControl.contactInfo.email && (
              <p className="mb-1">
                <a href={`mailto:${siteControl.contactInfo.email}`} className="text-blue-600 hover:text-blue-700 break-all">
                  {siteControl.contactInfo.email}
                </a>
              </p>
            )}
            {siteControl.contactInfo.phone && (
              <p className="mb-0">
                <a href={`tel:${siteControl.contactInfo.phone}`} className="text-blue-600 hover:text-blue-700">
                  {siteControl.contactInfo.phone}
                </a>
              </p>
            )}
          </address>
        </div>
      </div>
    </div>
  );
}
