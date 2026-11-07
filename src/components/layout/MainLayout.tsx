import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileMenu } from './MobileMenu';

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 pt-16 md:pt-18">
        <Outlet />
      </main>
      <Footer />
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
