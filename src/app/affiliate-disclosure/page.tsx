import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Info } from 'lucide-react';

export const metadata = {
  alternates: { canonical: '/affiliate-disclosure' },
  title: 'Affiliate Disclosure',
  description: 'Full transparency regarding our affiliate partnerships, link tracking and revenue disclosure.',
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 border-b border-surface-border pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transparency & FTC / Indian Advertising Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-copy-primary">
          Affiliate Program Disclosure
        </h1>
        <p className="text-xs text-copy-secondary">
          Last Updated: November 2026
        </p>
      </div>

      <div className="prose prose-emerald max-w-none space-y-6 text-sm text-copy-secondary leading-relaxed bg-white p-8 rounded-3xl border border-surface-border">
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong className="font-semibold block text-xs uppercase tracking-wider mb-1">
              Short Summary
            </strong>
            <p className="text-xs leading-normal">
              SimpleXplore is NOT a retail store. We do not sell items directly, process payments, or maintain warehouses. When you click links on our site and make purchases on merchant websites, we may earn an affiliate commission at no extra cost to you.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-copy-primary pt-2">1. How SimpleXplore Operates</h3>
        <p>
          SimpleXplore is an affiliate discovery and smart shopping portal based in India. Our mission is to discover high-value deals, price cuts, and curated product recommendations from trusted online retailers including <strong>Amazon India (Amazon Associates Program)</strong>, <strong>Flipkart Affiliate Program</strong>, <strong>Myntra</strong>, <strong>Nykaa</strong>, <strong>Tata CLiQ</strong>, and other reputable affiliate networks.
        </p>

        <h3 className="text-lg font-bold text-copy-primary pt-2">2. Amazon Associates Disclosure</h3>
        <p>
          SimpleXplore is a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in. As an Amazon Associate, SimpleXplore earns from qualifying purchases.
        </p>

        <h3 className="text-lg font-bold text-copy-primary pt-2">3. No Extra Cost to You</h3>
        <p>
          The affiliate commissions we earn come directly from the merchant as a promotional cost. You pay the exact same price (or lower when using our discovered deal codes and verified discounts) whether you purchase through our link or navigate to the merchant directly.
        </p>

        <h3 className="text-lg font-bold text-copy-primary pt-2">4. Price Accuracy Disclaimer</h3>
        <p>
          Retail prices, promotional discounts, vouchers, and product stock levels on e-commerce platforms can change dynamically multiple times per day. While our automated extraction and admin verification teams work tirelessly to ensure accurate prices, the price and availability displayed on the merchant&apos;s checkout page at the exact moment of purchase is always definitive.
        </p>

        <h3 className="text-lg font-bold text-copy-primary pt-2">5. Editorial Independence</h3>
        <p>
          Our editorial curation process prioritizes value, user ratings, brand reputation, and genuine discounts. Retailers do not dictate our recommendations. Every deal imported into our admin staging area undergoes manual review before public release.
        </p>

        <div className="pt-6 border-t border-surface-border flex items-center justify-between">
          <p className="text-xs text-copy-muted">
            Have questions regarding our affiliate relationships?
          </p>
          <Link href="/contact" className="text-xs font-semibold text-brand-600 hover:underline">
            Contact our Compliance Team →
          </Link>
        </div>
      </div>
    </div>
  );
}

