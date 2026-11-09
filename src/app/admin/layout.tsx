import React from 'react';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeaderActions from '@/components/admin/AdminHeaderActions';
import { ShieldCheck } from 'lucide-react';
import { getAdminSession } from '@/lib/auth';

export const metadata = {
  title: 'Admin Dashboard | SimpleXplore',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side verification of the signed admin session (middleware also checks).
  const session = await getAdminSession();
  if (!session) {
    redirect('/login?redirect=/admin&error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col md:flex-row font-sans text-copy-primary">
      {/* Dedicated Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-surface-border px-6 py-3.5 flex items-center justify-between shadow-soft-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-copy-primary">
              SimpleXplore Control Engine
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="bg-brand-50 text-brand-800 border border-brand-200/80 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: Master Admin
            </span>
            <span className="text-copy-muted hidden sm:inline">Administrator</span>
            <div className="h-4 w-[1px] bg-surface-border hidden sm:block" />
            <AdminHeaderActions />
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
