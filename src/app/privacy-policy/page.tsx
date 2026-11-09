import React from 'react';
import { getSiteUrl } from '@/lib/seo';

export const metadata = {
  alternates: { canonical: '/privacy-policy' },
  title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-3xl font-extrabold font-display text-copy-primary">
          Privacy Policy
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Last revised: November 2026
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-border space-y-6 text-sm text-copy-secondary leading-relaxed">
        <p>
          At <strong>SimpleXplore</strong>, accessible from {getSiteUrl()}, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information collected and how we use it.
        </p>

        <h3 className="text-base font-bold text-copy-primary">1. Information We Collect</h3>
        <p>
          Visitors can browse SimpleXplore anonymously without registering. If you choose to create an account to manage a saved wishlist, we collect your email address and authentication credentials handled securely via Supabase Auth.
        </p>

        <h3 className="text-base font-bold text-copy-primary">2. Affiliate Link Clicks & Cookies</h3>
        <p>
          When you click on an outbound affiliate link, an anonymous click event is registered to measure deal popularity and analytics. When redirected to merchant sites (like Amazon, Flipkart), those merchants may use cookies in accordance with their respective privacy policies to track qualifying purchases.
        </p>

        <h3 className="text-base font-bold text-copy-primary">3. No Selling of Personal Information</h3>
        <p>
          We do not sell, rent, or trade your personal information to third parties under any circumstances.
        </p>

        <h3 className="text-base font-bold text-copy-primary">4. Data Security</h3>
        <p>
          We use industry-standard HTTPS encryption, secure database Row Level Security (RLS), and server-side secret isolation to ensure all visitor and account data remains protected.
        </p>
      </div>
    </div>
  );
}

