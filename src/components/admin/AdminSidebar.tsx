'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  UploadCloud, 
  Layers, 
  Send, 
  Clock, 
  BarChart3, 
  Settings, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Globe,
  ArrowRight
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleAdminSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Overview', href: '/admin', exact: true, icon: LayoutDashboard },
    { label: 'All Products', href: '/admin/products', exact: true, icon: Package },
    { label: 'Add Product', href: '/admin/products/new', exact: true, icon: PlusCircle },
    { label: 'Bulk CSV / Excel', href: '/admin/bulk-upload', exact: true, icon: UploadCloud },
    { label: 'Categories', href: '/admin/categories', exact: true, icon: Layers },
    { 
      label: 'Telegram Sync', 
      href: '/admin/telegram', 
      exact: true,
      icon: Send,
    },
    { 
      label: 'Pending Review', 
      href: '/admin/telegram/imports', 
      exact: false,
      icon: Clock,
      badge: 'Drafts'
    },
    { label: 'Click Analytics', href: '/admin/analytics', exact: true, icon: BarChart3 },
    { label: 'Website Settings', href: '/admin/settings', exact: true, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#141C14] text-[#D8E2D8] flex flex-col justify-between border-r border-[#243324] min-h-screen">
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#243324]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <div>
              <span className="font-display font-black text-lg text-white tracking-tight">
                Simple<span className="text-brand-400">Admin</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] text-brand-400 font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                <span>Affiliate Portal</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Shortcut to Customer Storefront View */}
        <div>
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#1C291C] hover:bg-[#253925] text-brand-300 hover:text-white border border-[#2B402B] transition-all group"
            title="Switch to customer storefront view with account persisted"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
              <span>Customer View</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // Precise active logic to avoid multiple concurrent highlights
            let isActive = false;
            if (item.exact) {
              isActive = pathname === item.href;
              // If viewing /admin/products/[id]/edit, keep "All Products" highlighted
              if (item.href === '/admin/products' && pathname.startsWith('/admin/products/') && pathname !== '/admin/products/new') {
                isActive = true;
              }
            } else {
              isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none focus:outline-none transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-soft-sm'
                    : 'text-[#B0C0B0] hover:bg-[#202C20] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer link to public site & Logout */}
      <div className="p-4 border-t border-[#243324] space-y-2">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 text-xs text-[#A8B8A8] hover:text-white hover:bg-[#202C20] rounded-xl transition-colors"
          title="Return to customer landing page with account persisted"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-brand-400" />
            <span>Customer Landing Page</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 opacity-60" />
        </Link>

        <button
          type="button"
          onClick={handleAdminSignOut}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors font-semibold"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

