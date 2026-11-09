'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { Edit, Trash2, Globe, EyeOff } from 'lucide-react';

export default function ProductTableActions({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    const nextStatus = product.status === 'published' ? 'draft' : 'published';
    setLoading(true);
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, status: nextStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE',
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={toggleStatus}
        disabled={loading}
        title={product.status === 'published' ? 'Unpublish to draft' : 'Publish to live store'}
        className={`p-1.5 rounded-lg border transition-colors ${
          product.status === 'published'
            ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            : 'border-amber-200 text-amber-700 hover:bg-amber-50'
        }`}
      >
        {product.status === 'published' ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>

      <Link
        href={`/admin/products/${product.id}/edit`}
        className="p-1.5 rounded-lg border border-surface-border text-copy-secondary hover:bg-surface-bg hover:text-copy-primary transition-colors"
        title="Edit product"
      >
        <Edit className="w-3.5 h-3.5" />
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 rounded-lg border border-surface-border text-copy-muted hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        title="Delete product"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

