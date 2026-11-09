'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminHeaderActions() {
  const router = useRouter();

  const handleSignOut = async () => {
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

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
        title="View customer storefront landing page with account persisted"
      >
        <Globe className="w-3.5 h-3.5 text-brand-600" />
        <span className="hidden sm:inline">Customer View</span>
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border text-copy-secondary hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold transition-colors"
        title="Sign out of Admin Portal"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  );
}

