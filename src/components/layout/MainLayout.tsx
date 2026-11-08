import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileMenu } from './MobileMenu';

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 pt-16 lg:pt-18 min-w-0">
        <Outlet />
      </main>
      <Footer />
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
