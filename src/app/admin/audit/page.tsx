import React from 'react';
import Link from 'next/link';
import { ScrollText } from 'lucide-react';
import { db, type AuditLogEntry } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

const ENTITY_FILTERS = [
  { value: '', label: 'Everything' },
  { value: 'product', label: 'Products' },
  { value: 'category', label: 'Categories' },
  { value: 'telegram_import', label: 'Telegram' },
  { value: 'settings', label: 'Settings' },
  { value: 'image', label: 'Images' },
  { value: 'session', label: 'Sign-ins' },
];

/** Human-readable wording for each recorded action. */
const ACTION_LABELS: Record<string, string> = {
  'product.create': 'Created product',
  'product.update': 'Edited product',
  'product.publish': 'Published product',
  'product.unpublish': 'Unpublished product',
  'product.delete': 'Deleted product',
  'product.duplicate': 'Duplicated product',
  'product.bulk_import': 'Bulk-imported products',
  'product.clear_demo_defaults': 'Cleared demo products',
  'category.create': 'Created category',
  'category.update': 'Edited category',
  'category.delete': 'Deleted category',
  'settings.update': 'Changed website settings',
  'telegram.approve_publish': 'Approved & published import',
  'telegram.reject': 'Rejected import',
  'telegram.retry': 'Retried failed import',
  'telegram.register_webhook': 'Registered Telegram webhook',
  'image.upload': 'Uploaded image',
  'admin.login': 'Signed in',
  'admin.login_failed': 'Failed admin sign-in',
};

function summary(e: AuditLogEntry): string {
  const d = e.details ?? {};
  const parts: string[] = [];
  if (typeof d.title === 'string') parts.push(`“${d.title}”`);
  if (typeof d.name === 'string') parts.push(`“${d.name}”`);
  if (Array.isArray(d.fields) && d.fields.length) parts.push(`fields: ${(d.fields as string[]).join(', ')}`);
  if (typeof d.count === 'number') parts.push(`${d.count} item(s)`);
  if (d.ok === false && typeof d.error === 'string') parts.push(`failed: ${d.error}`);
  if (d.bulk) parts.push('bulk approval');
  if (typeof d.ip === 'string') parts.push(`IP ${d.ip}`);
  return parts.join(' · ');
}

interface AuditPageProps {
  searchParams: { page?: string; type?: string };
}

export default async function AuditLogPage({ searchParams }: AuditPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const type = ENTITY_FILTERS.some(f => f.value === searchParams.type) ? searchParams.type ?? '' : '';
  const { entries, total } = await db.getAuditLogs({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, entityType: type || undefined });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number, t = type) => `/admin/audit?${new URLSearchParams({ ...(t ? { type: t } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
          <ScrollText className="w-7 h-7 text-brand-600" />
          Audit Log
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Every change made in the admin area, newest first. Entries can’t be edited or deleted.
        </p>
      </div>

      <nav aria-label="Filter audit log" className="flex flex-wrap gap-2">
        {ENTITY_FILTERS.map(f => (
          <Link
            key={f.value}
            href={href(1, f.value)}
            aria-current={type === f.value ? 'page' : undefined}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              type === f.value ? 'border-copy-primary bg-copy-primary text-white' : 'border-surface-border bg-white text-copy-secondary hover:bg-surface-bg'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-3xl border border-surface-border bg-white shadow-soft-sm">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-b border-surface-border bg-surface-bg font-semibold uppercase tracking-wider text-copy-secondary">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">What</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-copy-muted">
                  Nothing recorded yet. Changes you make in the admin area will appear here.
                </td>
              </tr>
            ) : (
              entries.map(e => (
                <tr key={e.id} className={e.action === 'admin.login_failed' ? 'bg-red-50/60' : ''}>
                  <td className="whitespace-nowrap px-4 py-3 text-copy-secondary tabular">
                    {new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-copy-primary">{e.admin_email ?? <span className="text-copy-muted">unknown</span>}</td>
                  <td className="px-4 py-3 font-semibold text-copy-primary">
                    {ACTION_LABELS[e.action] ?? e.action}
                    {e.entity_type === 'product' && e.entity_id && e.action !== 'product.delete' && (
                      <Link href={`/admin/products/${e.entity_id}/edit`} className="ml-2 font-normal text-brand-700 hover:underline">
                        open
                      </Link>
                    )}
                    {e.entity_type === 'telegram_import' && e.entity_id && (
                      <Link href={`/admin/telegram/imports/${e.entity_id}`} className="ml-2 font-normal text-brand-700 hover:underline">
                        open
                      </Link>
                    )}
                  </td>
                  <td className="max-w-md px-4 py-3 text-copy-secondary">{summary(e) || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-xs text-copy-secondary">
          <span>
            Page {page} of {pages} · {total} entries
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href(page - 1)} className="rounded-xl border border-surface-border bg-white px-3 py-1.5 font-semibold hover:bg-surface-bg">
                Newer
              </Link>
            )}
            {page < pages && (
              <Link href={href(page + 1)} className="rounded-xl border border-surface-border bg-white px-3 py-1.5 font-semibold hover:bg-surface-bg">
                Older
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
