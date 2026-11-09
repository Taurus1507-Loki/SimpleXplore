'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Tag } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-surface-bg border-b border-surface-border/60">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-brand-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-700 shadow-soft-sm">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span>Smart Shopping • Handpicked Indian Retailer Deals</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-copy-primary tracking-tight leading-[1.12]">
            Discover Products <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 bg-clip-text text-transparent">
              You&apos;ll Love
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-copy-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            Explore smart shopping finds, trending products and exciting deals across Amazon, Flipkart, Myntra, and top retailers. We curate the best verified bargains so you never overpay.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm px-7 py-3.5 rounded-full shadow-md hover:shadow-card-hover active:scale-[0.98] transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/deals"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-surface-bg border border-surface-border text-copy-primary font-semibold text-sm px-6 py-3.5 rounded-full shadow-soft-sm transition-all"
            >
              <Tag className="w-4 h-4 text-brand-600" />
              <span>Today&apos;s Top Deals</span>
            </Link>
          </div>

          {/* Key Value Badges */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-surface-border/60 max-w-xl mx-auto text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-100/70 text-brand-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-copy-primary">Verified Deals</div>
                <div className="text-copy-muted text-[11px]">Real prices checked</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-copy-primary">Trending Picks</div>
                <div className="text-copy-muted text-[11px]">Updated daily</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-copy-primary">Direct Retailers</div>
                <div className="text-copy-muted text-[11px]">Amazon & Flipkart</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

