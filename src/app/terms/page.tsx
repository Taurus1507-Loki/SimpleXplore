import React from 'react';

export const metadata = {
  alternates: { canonical: '/terms' },
  title: 'Terms and Conditions',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-3xl font-extrabold font-display text-copy-primary">
          Terms & Conditions
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Effective Date: November 2026
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-border space-y-6 text-sm text-copy-secondary leading-relaxed">
        <h3 className="text-base font-bold text-copy-primary">1. Nature of Service</h3>
        <p>
          SimpleXplore is solely an affiliate product discovery portal. SimpleXplore does not manufacture, sell, store, warrant, or ship any products listed on this website. Any contractual relationship formed upon purchase exists entirely between you (the consumer) and the respective third-party retailer.
        </p>

        <h3 className="text-base font-bold text-copy-primary">2. Pricing and Availability</h3>
        <p>
          All product prices, coupons, and specifications displayed on SimpleXplore are sourced from third-party retailers or automated discovery feeds and are subject to real-time adjustments. We make no warranty that a deal will remain available at the listed price upon checkout on the retailer&apos;s site.
        </p>

        <h3 className="text-base font-bold text-copy-primary">3. Intellectual Property</h3>
        <p>
          Product images, logos, trademarks, and brand names referenced on this site belong to their respective copyright and trademark holders and are utilized solely for identification, descriptive, and affiliate reference purposes.
        </p>

        <h3 className="text-base font-bold text-copy-primary">4. Limitation of Liability</h3>
        <p>
          SimpleXplore shall not be liable for any dispute, defect, delayed shipment, pricing error, or dissatisfaction arising from purchases made on external retailer websites reached via links on this platform.
        </p>
      </div>
    </div>
  );
}

