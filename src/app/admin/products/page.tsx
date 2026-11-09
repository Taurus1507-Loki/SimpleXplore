import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils/formatters';
import { PlusCircle, Edit, Trash2, ExternalLink, Sparkles, TrendingUp, Package } from 'lucide-react';
import ProductTableActions from './ProductTableActions';

interface AdminProductsPageProps {
  searchParams: {
    status?: string;
    search?: string;
  };
}

export const revalidate = 0;

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const statusFilter = (searchParams.status || 'all') as 'all' | 'published' | 'draft' | 'archived';
  const search = searchParams.search;

  const { products, total } = await db.getProducts({
    status: statusFilter,
    search,
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
            <Package className="w-7 h-7 text-brand-600" />
            Catalog Products ({total})
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            Manage your manually added, bulk-uploaded, and Telegram-approved products
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-soft-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-3 text-xs">
        <Link
          href="/admin/products?status=all"
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            statusFilter === 'all' ? 'bg-copy-primary text-white' : 'text-copy-secondary hover:bg-surface-bg'
          }`}
        >
          All Products ({total})
        </Link>
        <Link
          href="/admin/products?status=published"
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            statusFilter === 'published' ? 'bg-brand-500 text-white' : 'text-copy-secondary hover:bg-surface-bg'
          }`}
        >
          Published Only
        </Link>
        <Link
          href="/admin/products?status=draft"
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            statusFilter === 'draft' ? 'bg-amber-500 text-white' : 'text-copy-secondary hover:bg-surface-bg'
          }`}
        >
          Drafts Only
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-soft-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="py-16 text-center text-xs text-copy-muted space-y-2">
            <Package className="w-8 h-8 mx-auto text-copy-muted" />
            <p className="font-semibold text-copy-primary">No products found</p>
            <p>Add a product manually or review Telegram drafts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-bg text-copy-secondary uppercase tracking-wider font-semibold border-b border-surface-border/80">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Retailer</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-bg/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-[#F8FAF8] border border-surface-border overflow-hidden flex-shrink-0 p-1">
                          <Image
                            src={p.image_url}
                            alt={p.title}
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                        <div className="space-y-0.5 max-w-sm">
                          <div className="font-bold text-copy-primary truncate">
                            {p.title}
                          </div>
                          <div className="text-[11px] text-copy-muted flex items-center gap-2">
                            <span>{p.category?.name || 'General'}</span>
                            {p.featured && (
                              <span className="text-purple-600 font-semibold flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                            {p.trending && (
                              <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" /> Trending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-copy-secondary">
                      <span className="px-2 py-0.5 rounded-md bg-surface-bg border border-surface-border">
                        {p.retailer}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-copy-primary">
                      {formatPrice(p.current_price, p.currency)}
                    </td>

                    <td className="py-3 px-4 text-copy-muted capitalize">
                      {p.source_type}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <ProductTableActions product={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

