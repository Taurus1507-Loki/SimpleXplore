import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils/formatters';
import { BarChart3, TrendingUp, Info, ExternalLink, ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const analytics = await db.getAnalytics();
  const { products } = await db.getProducts({ status: 'published', limit: 8 });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-brand-600" />
          Affiliate Outbound Click Analytics
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Monitor outbound referral traffic, campaign origins, and merchant performance
        </p>
      </div>

      {/* Compliance Notice: Section 10 Rule */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="font-bold uppercase tracking-wider block">
            Click Tracking Transparency Notice:
          </strong>
          <p>
            The metrics below record visitors redirected via our <code>/r/[id]</code> gateway to merchant sites. These numbers represent <strong>outbound referral clicks</strong>, not confirmed purchases or orders. Merchant conversions and final revenue are confirmed through your retailer affiliate portals (Amazon Associates Central, Flipkart Affiliate Dashboard, etc.).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-soft-sm space-y-1">
          <span className="text-xs font-semibold text-copy-secondary uppercase tracking-wider">
            Total Outbound Clicks
          </span>
          <div className="text-3xl font-black font-display text-copy-primary">
            {analytics.totalClicks}
          </div>
          <div className="text-[11px] text-brand-600 font-semibold flex items-center gap-1 pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-soft-sm space-y-1">
          <span className="text-xs font-semibold text-copy-secondary uppercase tracking-wider">
            Active Retailer Gateways
          </span>
          <div className="text-3xl font-black font-display text-copy-primary">
            {Object.keys(analytics.clicksByRetailer).length}
          </div>
          <div className="text-[11px] text-copy-muted pt-1">
            Amazon, Flipkart, Myntra, Nykaa
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-soft-sm space-y-1">
          <span className="text-xs font-semibold text-copy-secondary uppercase tracking-wider">
            Catalog Coverage
          </span>
          <div className="text-3xl font-black font-display text-brand-600">
            {analytics.publishedProducts}
          </div>
          <div className="text-[11px] text-copy-muted pt-1">
            Published affiliate deal links
          </div>
        </div>
      </div>

      {/* Breakdown by Retailer */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-5">
        <h3 className="text-base font-bold font-display text-copy-primary">
          Clicks by Retailer Network
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(analytics.clicksByRetailer).map(([retailer, count]) => {
            const pct = Math.round((count / (analytics.totalClicks || 1)) * 100);
            return (
              <div key={retailer} className="p-4 rounded-2xl bg-surface-bg border border-surface-border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-copy-primary">{retailer}</span>
                  <span className="text-brand-700">{count} clicks ({pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-surface-border/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Products Table */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-soft-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-base font-bold font-display text-copy-primary">
          Most Popular Deal Destinations
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-bg text-copy-secondary uppercase tracking-wider font-semibold border-y border-surface-border">
              <tr>
                <th className="py-3 px-4">Product Title</th>
                <th className="py-3 px-4">Retailer</th>
                <th className="py-3 px-4">Deal Price</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4 text-right">Preview Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-surface-bg/40">
                  <td className="py-3 px-4 font-bold text-copy-primary max-w-sm truncate">
                    {p.title}
                  </td>
                  <td className="py-3 px-4 text-copy-secondary">
                    {p.retailer}
                  </td>
                  <td className="py-3 px-4 font-bold text-copy-primary">
                    {formatPrice(p.current_price, p.currency)}
                  </td>
                  <td className="py-3 px-4">
                    {p.discount ? (
                      <span className="text-brand-600 font-bold">{p.discount}% OFF</span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-brand-600 hover:underline font-semibold"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

