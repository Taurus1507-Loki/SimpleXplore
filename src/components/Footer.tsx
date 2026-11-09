'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, Twitter, Instagram, Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages and auth pages (login / register)
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="bg-[#192219] text-[#CFD6CF] border-t border-[#293629] mt-16">
      {/* Upper footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight">
                Simple<span className="text-brand-400">Xplore</span>
              </span>
            </Link>
            <p className="text-xs text-[#9EAA9E] leading-relaxed">
              Shop Smart • Explore More. SimpleXplore is India&apos;s smart shopping discovery portal curating verified bargains and trending deals from top retailers.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://t.me/simplexplore_deals"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#273527] hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
                title="Join our Telegram Channel"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/simplexplore"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#273527] hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
                title="Follow on X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/simplexplore"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#273527] hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-3">
              Departments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/categories/electronics" className="hover:text-white transition-colors">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link href="/categories/fashion" className="hover:text-white transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link href="/categories/footwear" className="hover:text-white transition-colors">
                  Footwear & Sneakers
                </Link>
              </li>
              <li>
                <Link href="/categories/beauty-personal-care" className="hover:text-white transition-colors">
                  Beauty & Skincare
                </Link>
              </li>
              <li>
                <Link href="/categories/home-kitchen" className="hover:text-white transition-colors">
                  Home & Kitchen
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/deals" className="hover:text-white transition-colors">
                  Latest Verified Deals
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-white transition-colors">
                  Trending Products
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  My Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Mission
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/affiliate-disclosure" className="hover:text-white transition-colors text-amber-300">
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div className="mt-12 p-4 rounded-xl bg-[#202C20] border border-[#2B3B2B] text-[11px] text-[#A6B2A6] leading-relaxed">
          <p className="font-semibold text-white mb-1">
            Shopping Discovery Notice & Disclaimer:
          </p>
          <p>
            SimpleXplore is a shopping discovery platform. We are not an online merchant or direct retailer. We do not process payments, store physical inventory, handle shipping, or manage returns. When you click links and make a purchase on a merchant website (such as Amazon, Flipkart, Myntra, or others), we may receive a commission at no extra charge to you. Product pricing, discounts, and availability are set directly by retailers and are subject to immediate change.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-[#293629] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8B988B] gap-4">
          <p>© {new Date().getFullYear()} SimpleXplore. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Designed with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for smart shoppers in India
          </p>
        </div>
      </div>
    </footer>
  );
}

