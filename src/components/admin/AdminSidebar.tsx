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
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleAdminSignOut = async () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'sx_admin_demo=; path=/; max-age=0';
      document.cookie = 'sx_user_email=; path=/; max-age=0';
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'All Products', href: '/admin/products', icon: Package },
    { label: 'Add Product', href: '/admin/products/new', icon: PlusCircle },
    { label: 'Bulk CSV / Excel', href: '/admin/bulk-upload', icon: UploadCloud },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { 
      label: 'Telegram Sync', 
      href: '/admin/telegram', 
      icon: Send,
    },
    { 
      label: 'Pending Review', 
      href: '/admin/telegram/imports', 
      icon: Clock,
      badge: 'Review Drafts'
    },
    { label: 'Click Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Website Settings', href: '/admin/settings', icon: Settings },
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

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
                    Drafts
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
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-[#A8B8A8] hover:text-white hover:bg-[#202C20] rounded-xl transition-colors"
        >
          <span>View Public Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
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

