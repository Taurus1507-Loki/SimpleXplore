'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { Edit, Trash2, Globe, EyeOff, Copy, Eye } from 'lucide-react';

const btn = 'flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50';

export default function ProductTableActions({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(url: string, init: RequestInit): Promise<Record<string, unknown> | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setError((data.error as string) || 'Action failed.');
        return null;
      }
      return data;
    } catch {
      setError('Network error.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  const toggleStatus = async () => {
    const nextStatus = product.status === 'published' ? 'draft' : 'published';
    if (await call('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id, status: nextStatus }),
    })) router.refresh();
  };

  const handleDuplicate = async () => {
    const data = await call('/api/admin/products/duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id }),
    });
    const copy = data?.product as Product | undefined;
    if (copy) router.push(`/admin/products/${copy.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.title}"? This can't be undone.`)) return;
    if (await call(`/api/admin/products?id=${encodeURIComponent(product.id)}`, { method: 'DELETE' })) router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={toggleStatus}
          disabled={loading}
          aria-label={product.status === 'published' ? `Unpublish ${product.title}` : `Publish ${product.title}`}
          title={product.status === 'published' ? 'Unpublish to draft' : 'Publish to live store'}
          className={`${btn} ${
            product.status === 'published'
              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
          }`}
        >
          {product.status === 'published' ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <a
          href={`/products/${product.slug}`}
          target="_blank"
          rel="noopener"
          aria-label={`Preview ${product.title}`}
          title={product.status === 'published' ? 'View on site' : 'Preview draft (only you can see it)'}
          className={`${btn} border-surface-border text-copy-secondary hover:bg-surface-bg hover:text-copy-primary`}
        >
          <Eye className="w-3.5 h-3.5" />
        </a>

        <Link
          href={`/admin/products/${product.id}/edit`}
          aria-label={`Edit ${product.title}`}
          title="Edit product"
          className={`${btn} border-surface-border text-copy-secondary hover:bg-surface-bg hover:text-copy-primary`}
        >
          <Edit className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={handleDuplicate}
          disabled={loading}
          aria-label={`Duplicate ${product.title}`}
          title="Duplicate as a new draft"
          className={`${btn} border-surface-border text-copy-secondary hover:bg-surface-bg hover:text-copy-primary`}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          aria-label={`Delete ${product.title}`}
          title="Delete product"
          className={`${btn} border-surface-border text-copy-muted hover:border-red-200 hover:text-red-700 hover:bg-red-50`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {error && <p role="alert" className="text-[11px] text-red-700">{error}</p>}
    </div>
  );
}
