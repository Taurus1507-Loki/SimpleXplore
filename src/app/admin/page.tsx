import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils/formatters';
import { 
  Package, 
  Clock, 
  BarChart3, 
  Send, 
  PlusCircle, 
  UploadCloud, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const analytics = await db.getAnalytics();
  const telegramImports = await db.getTelegramImports({ review_status: 'pending' });
  const recentImports = telegramImports.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Title & Quick Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary">
            Affiliate Management Hub
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            Real-time status of your products, Telegram link imports, and retailer clicks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-soft-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/telegram/imports"
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-soft-sm transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Review Drafts ({analytics.pendingReviewImports})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft-sm space-y-2">
          <div className="flex items-center justify-between text-copy-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Products</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-copy-primary">
            {analytics.totalProducts}
          </div>
          <div className="text-[11px] text-copy-muted flex items-center gap-1">
            <span className="font-semibold text-brand-600">{analytics.publishedProducts} published</span>
            <span>•</span>
            <span className="text-amber-600">{analytics.pendingDrafts} drafts</span>
          </div>
        </div>

        {/* Card 2: Pending Telegram Drafts */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft-sm space-y-2">
          <div className="flex items-center justify-between text-copy-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Telegram Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-amber-600">
            {analytics.pendingReviewImports}
          </div>
          <div className="text-[11px] text-copy-muted">
            Strictly unpublished until approved
          </div>
        </div>

        {/* Card 3: Total Affiliate Clicks */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft-sm space-y-2">
          <div className="flex items-center justify-between text-copy-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Affiliate Outbound Clicks</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-copy-primary">
            {analytics.totalClicks}
          </div>
          <div className="text-[11px] text-copy-muted">
            Tracking Amazon, Flipkart & Myntra redirects
          </div>
        </div>

        {/* Card 4: Telegram Bot Integration Status */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft-sm space-y-2">
          <div className="flex items-center justify-between text-copy-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Telegram Automation</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-base font-bold text-copy-primary pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Active Listener</span>
          </div>
          <div className="text-[11px] text-copy-muted">
            Webhook ready & SSRF protected
          </div>
        </div>
      </div>

      {/* Pending Telegram Drafts Table Preview */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-soft-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-surface-border/80 pb-4">
          <div>
            <h2 className="text-lg font-bold font-display text-copy-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Telegram Imports Awaiting Approval
            </h2>
            <p className="text-xs text-copy-secondary">
              MANDATORY RULE: None of these products will appear on the website until you click &quot;Approve &amp; Publish&quot;.
            </p>
          </div>
          <Link
            href="/admin/telegram/imports"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Imports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentImports.length === 0 ? (
          <div className="py-8 text-center text-xs text-copy-muted">
            No pending Telegram drafts. When new affiliate links are posted in your Telegram channel, they will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-bg text-copy-secondary uppercase tracking-wider font-semibold border-y border-surface-border/60">
                <tr>
                  <th className="py-3 px-4">Product Draft</th>
                  <th className="py-3 px-4">Retailer</th>
                  <th className="py-3 px-4">Extracted Price</th>
                  <th className="py-3 px-4">Original Link</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {recentImports.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-bg/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-copy-primary max-w-xs truncate">
                      {item.extracted_data.title || 'Untitled Draft'}
                    </td>
                    <td className="py-3 px-4 text-copy-secondary">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.extracted_data.retailer || 'Retailer'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-copy-primary">
                      {formatPrice(item.extracted_data.price || 0, 'INR')}
                    </td>
                    <td className="py-3 px-4 text-copy-muted truncate max-w-[140px]">
                      {item.original_url}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        DRAFT (Pending)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/telegram/imports/${item.id}`}
                        className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 hover:bg-brand-500 hover:text-white font-semibold px-3 py-1.5 rounded-lg border border-brand-200 transition-colors"
                      >
                        <span>Review & Publish</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Retailer Click Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
          <h3 className="text-base font-bold font-display text-copy-primary">
            Clicks by Merchant Platform
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.clicksByRetailer).map(([retailer, count]) => {
              const pct = Math.round((count / (analytics.totalClicks || 1)) * 100);
              return (
                <div key={retailer} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-copy-primary">{retailer}</span>
                    <span className="text-copy-secondary font-bold">{count} clicks ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-surface-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-base font-bold font-display text-copy-primary">
              Admin Quick Tools
            </h3>
            <p className="text-xs text-copy-secondary">
              Streamline your catalog expansion and affiliate operations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/admin/bulk-upload"
              className="p-3.5 rounded-2xl bg-surface-bg hover:bg-brand-50 border border-surface-border hover:border-brand-200 transition-all text-xs font-semibold text-copy-primary flex flex-col items-center text-center gap-2"
            >
              <UploadCloud className="w-5 h-5 text-brand-600" />
              <span>Bulk CSV / Excel Upload</span>
            </Link>

            <Link
              href="/admin/telegram"
              className="p-3.5 rounded-2xl bg-surface-bg hover:bg-brand-50 border border-surface-border hover:border-brand-200 transition-all text-xs font-semibold text-copy-primary flex flex-col items-center text-center gap-2"
            >
              <Send className="w-5 h-5 text-purple-600" />
              <span>Telegram Sync Test</span>
            </Link>
          </div>

          <div className="text-[11px] text-copy-muted bg-[#F8FAF8] p-3 rounded-xl border border-surface-border/60">
            Note: All clicks are tracked anonymously via our 302 safe redirect router (<code className="text-copy-primary">/r/[id]</code>) preserving your UTM and affiliate tags.
          </div>
        </div>
      </div>
    </div>
  );
}

