import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Us | SimpleXplore',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-surface-border pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-copy-primary">
          About Simple<span className="text-brand-500">Xplore</span>
        </h1>
        <p className="text-sm text-copy-secondary">
          Shop Smart • Explore More. The affiliate shopping platform built for discerning Indian shoppers.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-border space-y-6 text-sm text-copy-secondary leading-relaxed">
        <h3 className="text-lg font-bold text-copy-primary">Our Mission</h3>
        <p>
          Navigating hundreds of sales events, flash deals, and fluctuating price tags across multiple e-commerce websites in India is exhausting. SimpleXplore was built to eliminate the noise. We find verified deals, compare price histories, and curate only authentic, highly rated products.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/60 space-y-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            <h4 className="font-bold text-copy-primary text-sm">Human Verified</h4>
            <p className="text-xs text-copy-secondary">
              No automatic spam. Every product imported from Telegram is reviewed by our admin before publication.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
            <Zap className="w-6 h-6 text-amber-600" />
            <h4 className="font-bold text-copy-primary text-sm">Telegram Automation</h4>
            <p className="text-xs text-copy-secondary">
              Integrated real-time channel updates bring sudden flash deals straight to our discovery hub.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <h4 className="font-bold text-copy-primary text-sm">Honest Value</h4>
            <p className="text-xs text-copy-secondary">
              We preserve retailer promotions and discounts so our readers enjoy maximum savings.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-border flex items-center justify-between">
          <p className="text-xs text-copy-muted">
            Ready to discover products you&apos;ll love?
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

