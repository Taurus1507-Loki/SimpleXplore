import React from 'react';
import Link from 'next/link';
import { Users, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

interface CustomersPageProps {
  searchParams: { q?: string; page?: string };
}

/** Registered shoppers (read-only). Customers can only save wishlists; they never edit products. */
export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const q = (searchParams.q ?? '').slice(0, 100);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { customers, total } = await db.getCustomers({ search: q, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const live = isSupabaseConfigured();
  const href = (p: number) => `/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-600" />
            Customers
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            {total} registered {total === 1 ? 'shopper' : 'shoppers'}. Customers can browse and save wishlists — they can’t change products.
          </p>
        </div>

        <form role="search" className="relative w-full sm:w-72">
          <label htmlFor="customer-search" className="sr-only">Search customers</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-muted" aria-hidden="true" />
          <input
            id="customer-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by email or name"
            className="h-10 w-full rounded-xl border border-surface-border bg-white pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          />
        </form>
      </div>

      {!live && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          Demo mode: this list only shows shoppers who registered or signed in since the server last started. Connect Supabase to keep real customer accounts.
        </p>
      )}

      <div className="overflow-x-auto rounded-3xl border border-surface-border bg-white shadow-soft-sm">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="border-b border-surface-border bg-surface-bg font-semibold uppercase tracking-wider text-copy-secondary">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Joined</th>
              {!live && <th className="px-4 py-3">Last sign-in</th>}
              <th className="px-4 py-3 text-right">Wishlist items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={live ? 3 : 4} className="px-4 py-12 text-center text-copy-muted">
                  {q ? `No customers match “${q}”.` : 'No customers yet.'}
                </td>
              </tr>
            ) : (
              customers.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-copy-primary">{c.full_name || c.email.split('@')[0]}</p>
                    <p className="text-copy-muted">{c.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-copy-secondary tabular">
                    {new Date(c.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                  {!live && (
                    <td className="whitespace-nowrap px-4 py-3 text-copy-secondary tabular">
                      {c.last_seen_at ? new Date(c.last_seen_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right font-semibold tabular">{c.wishlist_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-xs text-copy-secondary">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={href(page - 1)} className="rounded-xl border border-surface-border bg-white px-3 py-1.5 font-semibold hover:bg-surface-bg">Previous</Link>}
            {page < pages && <Link href={href(page + 1)} className="rounded-xl border border-surface-border bg-white px-3 py-1.5 font-semibold hover:bg-surface-bg">Next</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
