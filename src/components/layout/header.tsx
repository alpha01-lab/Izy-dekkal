'use client';

import { Bell, Search, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { createClient } from '@/lib/supabase/client';
import { getSettings } from '@/actions/settings';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [userEmail, setUserEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email ?? '');
    });
    getSettings().then(s => { if (s?.name) setShopName(s.name); });
  }, []);

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    });
  }

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const displayName = userEmail
    ? userEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '—';

  return (
    <>
      <header className="h-[72px] bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-300 group-focus-within:text-primary group-hover:text-primary/70" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-background-subtle border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-white hover:border-primary/40 hover:shadow-sm focus:bg-white focus:shadow-md focus:-translate-y-0.5"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-auto">
          <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-surface" />
          </button>

          <div className="h-8 w-px bg-border mx-1" />

          <div className="flex items-center gap-3 cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-text-primary leading-tight">{displayName}</p>
              <p className="text-xs text-text-secondary truncate max-w-[120px]">{shopName || 'Ma Boutique'}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full bg-[#0E1420] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
              title={userEmail}
            >
              <svg viewBox="0 0 48 48" className="w-[22px] h-[22px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 36C17 36 20 32 21 26H27C28 32 31 36 36 36H12Z" fill="#00853F" />
                <path d="M21 26.5L19 18L24 22L29 18L27 26.5H21Z" fill="#FDEF42" />
                <path d="M19 18L14 12M19 18L21 12M24 22L24 12M29 18L27 12M29 18L34 12" stroke="#FDEF42" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M14 12L10 6M14 12L16 6M12 9L8 8M15 9L18 5" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" />
                <path d="M21 12L19 5M21 12L22 6M20 8L17 5M21.5 8L24 4" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" />
                <path d="M27 12L29 5M27 12L26 6M28 8L31 5M26.5 8L24 4" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" />
                <path d="M34 12L38 6M34 12L32 6M36 9L40 8M33 9L30 5" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="h-8 w-px bg-border mx-1" />

          <button
            onClick={handleSignOut}
            disabled={isPending}
            title="Se déconnecter"
            className="p-2 text-text-secondary hover:text-danger transition-colors disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-[260px] h-full flex-shrink-0">
            <Sidebar />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 -right-12 p-2 bg-white rounded-full shadow-md text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
