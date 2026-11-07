import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
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

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      id="mobile-menu"
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl animate-slide-in" role="document">
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
          <h2 id="mobile-menu-title" className="font-heading font-bold text-xl text-navy-900">
            Меню
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Затвори меню"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1" aria-label="Мобилна навигация">
          {mainNav.map((item) => {
            const isDropdown = item.hasDropdown && dropdowns[item.href.replace('/', '') as keyof typeof dropdowns];
            const isActive = location.pathname === item.href || (item.hasDropdown && location.pathname.startsWith(item.href));

            if (isDropdown) {
              const dropdownItems = dropdowns[item.href.replace('/', '') as keyof typeof dropdowns];
              return (
                <div key={item.href} className="space-y-1">
                  <button
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors',
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                    )}
                    onClick={() => setDropdownOpen(dropdownOpen === item.href ? null : item.href)}
                    aria-expanded={dropdownOpen === item.href}
                    onKeyDown={(e) => handleKeyDown(e, item.href)}
                  >
                    {item.label}
                    <Icon
                      name="ChevronDown"
                      size={20}
                      className={cn('transition-transform duration-200', dropdownOpen === item.href && 'rotate-180')}
                    />
                  </button>

                  {dropdownOpen === item.href && (
                    <div className="pl-4 space-y-1 animate-slide-down">
                      {dropdownItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          onClick={onClose}
                          className="block px-4 py-2.5 text-base text-slate-600 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors"
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
                <Button
                  key={item.href}
                  onClick={() => { onClose(); }}
                  className="w-full justify-center"
                  asChild
                >
                  <Link to={item.href}>{item.label}</Link>
                </Button>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Icon name="Globe" size={18} />
              <span>Език</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="secondary" size="sm" className="flex-1">БГ</Button>
              <Button variant="outline" size="sm" className="flex-1">EN</Button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-4">
          <div className="text-sm text-slate-600">
            <p className="font-medium text-navy-900">{brandConfig.contact.address.full}</p>
            <p className="mt-1">
              <a href={`mailto:${brandConfig.contact.email}`} className="text-blue-600 hover:text-blue-700">
                {brandConfig.contact.email}
              </a>
            </p>
            <p className="mt-1">
              <a href={`tel:${brandConfig.contact.phone}`} className="text-blue-600 hover:text-blue-700">
                {brandConfig.contact.phone}
              </a>
            </p>
          </div>

          <div className="flex gap-4">
            {Object.entries(brandConfig.social).map(([key, url]) => {
              const iconMap: Record<string, string> = {
                linkedin: 'Linkedin',
                github: 'Github',
                facebook: 'Facebook',
                twitter: 'Twitter'
              };
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                  aria-label={key}
                >
                  <Icon name={iconMap[key] as string} size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}