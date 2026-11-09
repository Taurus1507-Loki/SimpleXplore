import React from 'react';
import Image from 'next/image';
import { db } from '@/lib/db';
import { Layers, Plus, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await db.getCategories();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-brand-600" />
            Categories Management
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            Browse and organize product departments across SimpleXplore
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-surface-border shadow-soft-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-bg text-copy-secondary uppercase tracking-wider font-semibold border-b border-surface-border">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Department Name</th>
              <th className="py-3 px-4">URL Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-surface-bg/40">
                <td className="py-3 px-4">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface-bg border border-surface-border">
                    <Image
                      src={c.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100'}
                      alt={c.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 font-bold text-copy-primary">
                  {c.name}
                </td>
                <td className="py-3 px-4 font-mono text-copy-muted">
                  /categories/{c.slug}
                </td>
                <td className="py-3 px-4 text-copy-secondary max-w-xs truncate">
                  {c.description || '—'}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-brand-600" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

