'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Heart, 
  Menu, 
  X, 
  Flame, 
  Percent, 
  Grid, 
  Sparkles,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useWishlist } from './WishlistContext';
import { createClient } from '@/lib/supabase/client';
import { isUserAdmin } from '@/lib/auth';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();

  // Hide public customer header completely on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      // Check admin cookie or active session
      if (typeof document !== 'undefined') {
        const hasAdminCookie = document.cookie.includes('sx_admin_demo=true');
        const emailCookieMatch = document.cookie.match(/sx_user_email=([^;]+)/);
        const cookieEmail = emailCookieMatch ? decodeURIComponent(emailCookieMatch[1]) : null;

        if (hasAdminCookie) {
          setUserEmail('simplore01@gmail.com');
          setIsAdmin(true);
          return;
        }

        if (cookieEmail) {
          setUserEmail(cookieEmail);
          setIsAdmin(isUserAdmin(cookieEmail));
          return;
        }
      }

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const email = session.user.email;
          setUserEmail(email);
          setIsAdmin(isUserAdmin(email, session.user.user_metadata?.role));
        }
      } catch {
        // Fallback
      }
    };

    checkAuth();
  }, [pathname]);

  const handleSignOut = async () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'sx_admin_demo=; path=/; max-age=0';
      document.cookie = 'sx_user_email=; path=/; max-age=0';
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    setUserEmail(null);
    setIsAdmin(false);
    setUserDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-surface-border/80 shadow-soft-sm backdrop-blur-md bg-white/95">
      {/* Top announcement bar - strictly customer-friendly, no "affiliate" or "admin portal" text */}
      <div className="bg-brand-600 text-white text-xs py-1.5 px-4 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-brand-700/60 px-2 py-0.5 rounded text-[11px]">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              Verified Deals
            </span>
            <span className="hidden sm:inline">Handpicked shopping finds and top deals from Amazon, Flipkart, Myntra & more</span>
            <span className="sm:hidden">Top Verified India Deals</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/deals" className="hover:underline text-emerald-100">
              Today&apos;s Price Drops
            </Link>
            <span className="text-emerald-400">|</span>
            <Link href="/contact" className="hover:underline text-emerald-100">
              Customer Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex flex-col group flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tight text-copy-primary group-hover:text-brand-600 transition-colors">
                Simple<span className="text-brand-500">Xplore</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-copy-secondary font-semibold -mt-1 hidden sm:block">
                Shop Smart • Explore More
              </span>
            </div>
          </div>
        </Link>

        {/* Global Search Bar (Amazon style) */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-2xl mx-2 sm:mx-6 hidden md:flex items-center relative"
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products, brands, or deals (e.g. Sony ANC, Sneakers, Air Fryer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F3F5F3] hover:bg-[#EDF2ED] focus:bg-white text-copy-primary text-sm rounded-full pl-11 pr-24 py-2.5 border border-transparent focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-copy-muted shadow-inner"
            />
            <Search className="w-4 h-4 text-copy-secondary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Action icons (Wishlist, Account / Auth) */}
        <div className="flex items-center gap-3">
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 text-copy-primary hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors group relative"
            title="Your Wishlist"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-copy-primary group-hover:text-brand-600 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium hidden sm:inline">Wishlist</span>
          </Link>

          {/* User Authentication Status */}
          {userEmail ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200/80 px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{userEmail}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-surface-border p-2 space-y-1 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-surface-border/60">
                    <p className="text-[11px] text-copy-muted">Signed in as</p>
                    <p className="text-xs font-bold text-copy-primary truncate">{userEmail}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                      <span>Admin Control Hub</span>
                    </Link>
                  )}

                  <Link
                    href="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-copy-primary hover:bg-surface-bg transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>My Wishlist ({wishlistCount})</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/60 px-3.5 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-copy-primary hover:bg-surface-bg border border-surface-border transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sub-navigation bar with active route highlighting */}
      <nav className="border-t border-surface-border/50 bg-[#FAFBF9] px-4 sm:px-6 lg:px-8 py-2 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium text-copy-secondary">
          <div className="flex items-center gap-1.5">
            {[
              { label: 'All Products', href: '/products', icon: Grid, exact: true },
              { label: 'Categories', href: '/categories', exact: true },
              { label: 'Latest Deals', href: '/deals', icon: Percent, isDeal: true },
              { label: 'Trending Now', href: '/trending', icon: Flame, isTrending: true },
              { label: 'Electronics', href: '/categories/electronics' },
              { label: 'Fashion', href: '/categories/fashion' },
              { label: 'Footwear', href: '/categories/footwear' },
              { label: 'Beauty', href: '/categories/beauty-personal-care' },
              { label: 'Home & Kitchen', href: '/categories/home-kitchen' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname === item.href || pathname.startsWith(item.href + '/');

              let activeStyles = 'bg-brand-50 text-brand-700 border-brand-300 font-bold shadow-soft-sm';
              if (item.isDeal) {
                activeStyles = 'bg-amber-50 text-amber-800 border-amber-300 font-bold shadow-soft-sm';
              } else if (item.isTrending) {
                activeStyles = 'bg-rose-50 text-rose-800 border-rose-300 font-bold shadow-soft-sm';
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all duration-200 ${
                    isActive
                      ? activeStyles
                      : 'border-transparent text-copy-secondary hover:text-copy-primary hover:bg-white hover:border-surface-border'
                  }`}
                >
                  {Icon && (
                    <Icon className={`w-3.5 h-3.5 ${
                      isActive
                        ? item.isDeal ? 'text-amber-600' : item.isTrending ? 'text-rose-600' : 'text-brand-600'
                        : item.isDeal ? 'text-amber-600' : item.isTrending ? 'text-rose-600' : 'text-copy-muted'
                    }`} />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="text-[11px] text-copy-muted flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Discover Top Daily Price Cuts</span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer with active highlights */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-white p-4 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F3F5F3] text-copy-primary text-sm rounded-full pl-10 pr-20 py-2 border border-surface-border focus:outline-none focus:border-brand-500"
            />
            <Search className="w-4 h-4 text-copy-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm font-medium pt-2">
            {[
              { label: 'All Products', href: '/products', icon: Grid },
              { label: 'Latest Deals', href: '/deals', icon: Percent, isDeal: true },
              { label: 'Trending', href: '/trending', icon: Flame, isTrending: true },
              { label: 'Categories', href: '/categories' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all ${
                    isActive
                      ? item.isDeal ? 'bg-amber-50 text-amber-800 border-amber-300' : item.isTrending ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-brand-50 text-brand-700 border-brand-300'
                      : 'border-transparent hover:bg-surface-bg text-copy-primary'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link 
              href="/wishlist" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/wishlist'
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'border-transparent hover:bg-surface-bg text-copy-primary'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Wishlist ({wishlistCount})
            </Link>
            {isAdmin ? (
              <Link 
                href="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-xs hover:bg-surface-bg text-brand-700 font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Admin Hub
              </Link>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-xs hover:bg-surface-bg text-brand-700 font-semibold"
              >
                <User className="w-4 h-4 text-brand-600" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

