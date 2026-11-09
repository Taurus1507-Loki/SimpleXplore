import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductForm from '@/components/admin/ProductForm';
import { ArrowLeft, PlusCircle, Send } from 'lucide-react';
import type { Product } from '@/types';

export const revalidate = 0;

interface NewProductPageProps {
  searchParams: { fromImport?: string };
}

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const categories = await db.getCategories();

  // "Create manually" from a failed Telegram import: pre-fill only what we actually know.
  const sourceImport = searchParams.fromImport ? await db.getTelegramImportById(searchParams.fromImport) : null;
  let prefill: Partial<Product> | undefined;
  if (sourceImport) {
    const x = sourceImport.extracted_data ?? {};
    prefill = {
      title: x.title,
      retailer: x.retailer,
      current_price: x.price,
      original_price: x.original_price,
      discount: x.discount,
      image_url: x.image_url,
      description: x.description,
      // The link exactly as posted keeps affiliate tracking intact.
      affiliate_url: sourceImport.original_url || sourceImport.affiliate_url,
    };
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <Link
          href={sourceImport ? `/admin/telegram/imports/${sourceImport.id}` : '/admin/products'}
          className="p-2 rounded-xl bg-white border border-surface-border text-copy-secondary hover:text-copy-primary hover:bg-surface-bg transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black font-display text-copy-primary flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-brand-600" />
            {sourceImport ? 'Create Product from Telegram Import' : 'Add New Affiliate Product'}
          </h1>
          <p className="text-xs text-copy-secondary">
            Manually enter a product, configure prices, discount, and affiliate URL
          </p>
        </div>
      </div>

      {sourceImport && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-xs text-brand-900 space-y-1.5">
          <p className="flex items-center gap-1.5 font-semibold">
            <Send className="h-3.5 w-3.5" aria-hidden="true" /> Pre-filled from the Telegram post
          </p>
          <p className="break-all">
            <span className="text-brand-700">Original link:</span> {sourceImport.original_url}
          </p>
          {sourceImport.extracted_data?.raw_message && (
            <p className="whitespace-pre-line text-brand-800/80">{sourceImport.extracted_data.raw_message}</p>
          )}
          <p className="text-brand-700">Fill in anything missing. Saving links this product to the import.</p>
        </div>
      )}

      <ProductForm categories={categories} prefill={prefill} sourceImportId={sourceImport?.id} />
    </div>
  );
}
