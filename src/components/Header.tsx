'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Heart, Menu, X, User, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { useWishlist } from './WishlistContext';
import { createClient } from '@/lib/supabase/client';
import Logo from './Logo';

interface HeaderProps {
  initialEmail: string | null;
  initialIsAdmin: boolean;
}

const NAV = [
  { label: 'Home', href: '/', exact: true },
  { label: 'All Products', href: '/products', exact: true },
  { label: 'Categories', href: '/categories' },
  { label: 'Latest Deals', href: '/deals' },
  { label: 'Trending', href: '/trending' },
];

const QUICK_CATEGORIES = [
  { label: 'Fashion', href: '/categories/fashion' },
  { label: 'Footwear', href: '/categories/footwear' },
  { label: 'Electronics', href: '/categories/electronics' },
  { label: 'Beauty', href: '/categories/beauty-personal-care' },
  { label: 'Home & Kitchen', href: '/categories/home-kitchen' },
];

const supabaseEnabled =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !/placeholder|example\.supabase\.co|your-supabase/.test(process.env.NEXT_PUBLIC_SUPABASE_URL);

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
}

function SearchForm({ id, onSubmitted }: { id: string; onSubmitted?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        router.push(`/products?search=${encodeURIComponent(q)}`);
        onSubmitted?.();
      }}
      className="relative w-full"
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-muted" aria-hidden="true" />
      <input
        id={id}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Search sneakers, earbuds, air fryers…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-11 w-full rounded-xl border border-surface-border bg-surface-muted pl-11 pr-24 text-sm text-copy-primary placeholder:text-copy-muted transition-colors hover:border-brand-200 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-ink px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.97]"
      >
        Search
      </button>
    </form>
  );
}

export default function Header({ initialEmail, initialIsAdmin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail);
  const isAdmin = initialIsAdmin;
  const router = useRouter();
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setUserEmail(initialEmail), [initialEmail]);

  // Pick up a live Supabase customer session for display (never for admin rights).
  useEffect(() => {
    if (initialEmail || !supabaseEnabled) return;
    createClient()
      .auth.getSession()
      .then(({ data }) => data.session?.user?.email && setUserEmail(data.session.user.email))
      .catch(() => {});
  }, [initialEmail]);

  // Close menus on navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Escape + click-outside for the account menu.
  useEffect(() => {
    if (!userMenuOpen && !mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [userMenuOpen, mobileMenuOpen]);

  // Customer chrome is hidden on admin and auth screens.
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (supabaseEnabled) await createClient().auth.signOut();
    } catch {}
    setUserEmail(null);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
        <Logo className="shrink-0" />

        <div className="hidden flex-1 md:block md:max-w-xl lg:max-w-2xl">
          <SearchForm id="header-search" />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/wishlist"
            className="relative inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-copy-primary transition-colors hover:bg-surface-muted hover:text-brand-700"
            aria-label={`Wishlist, ${wishlistCount} saved`}
          >
            <span className="relative">
              <Heart className="h-5 w-5" aria-hidden="true" />
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span
                    key={wishlistCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="tabular absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-ink"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="hidden lg:inline">Wishlist</span>
          </Link>

          {userEmail ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="inline-flex h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-copy-primary transition-colors hover:bg-surface-muted"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
                <span className="sr-only">Account menu</span>
                <ChevronDown
                  className={`hidden h-4 w-4 text-copy-muted transition-transform sm:block ${userMenuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-60 origin-top-right rounded-2xl border border-surface-border bg-white p-1.5 shadow-soft-lg"
                  >
                    <div className="border-b border-surface-border px-3 py-2.5">
                      <p className="text-[11px] text-copy-muted">Signed in as</p>
                      <p className="truncate text-sm font-semibold text-ink">{userEmail}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        role="menuitem"
                        href="/admin"
                        className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Admin dashboard
                      </Link>
                    )}
                    <Link
                      role="menuitem"
                      href="/wishlist"
                      className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 text-sm text-copy-primary hover:bg-surface-muted"
                    >
                      <Heart className="h-4 w-4" aria-hidden="true" />
                      My wishlist ({wishlistCount})
                    </Link>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={handleSignOut}
                      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-copy-primary hover:bg-surface-muted"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-soft-sm transition-colors hover:bg-brand-700 active:scale-[0.98]"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-copy-primary hover:bg-surface-muted md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile: search is always one tap away. */}
      <div className="px-4 pb-3 md:hidden">
        <SearchForm id="mobile-search" />
      </div>

      {/* Desktop sub-navigation with a shared-layout active indicator. */}
      <nav aria-label="Primary" className="hidden border-t border-surface-border/70 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex h-11 items-center px-3 text-sm transition-colors ${
                      active ? 'font-semibold text-ink' : 'text-copy-secondary hover:text-ink'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-600"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="hidden items-center gap-4 text-sm text-copy-muted lg:flex">
            {QUICK_CATEGORIES.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="hover:text-brand-700">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-surface-border bg-white md:hidden"
          >
            <ul className="grid grid-cols-2 gap-1 p-3">
              {[...NAV, { label: 'Wishlist', href: '/wishlist', exact: true }].map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-[44px] items-center rounded-xl px-3 text-sm ${
                        active ? 'bg-brand-50 font-semibold text-brand-800' : 'text-copy-primary hover:bg-surface-muted'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="flex gap-2 border-t border-surface-border p-3">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Admin dashboard
                </Link>
              ) : userEmail ? null : (
                <>
                  <Link
                    href="/login"
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border text-sm font-semibold"
                  >
                    <User className="h-4 w-4" aria-hidden="true" /> Log in
                  </Link>
                  <Link
                    href="/register"
                    className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
