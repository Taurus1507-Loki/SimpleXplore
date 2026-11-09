'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, Instagram, Facebook } from 'lucide-react';
import Logo from './Logo';
import type { WebsiteSettings } from '@/types';

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.8-6.3L6.4 22H3.3l7.3-8.3L1 2h6.3l4.4 5.8L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      ['All products', '/products'],
      ['Latest deals', '/deals'],
      ['Trending', '/trending'],
      ['Categories', '/categories'],
      ['My wishlist', '/wishlist'],
    ],
  },
  {
    title: 'Categories',
    links: [
      ["Women's fashion", '/categories/womens-fashion'],
      ["Men's fashion", '/categories/mens-fashion'],
      ['Footwear', '/categories/footwear'],
      ['Electronics', '/categories/electronics'],
      ['Home & kitchen', '/categories/home-kitchen'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About SimpleXplore', '/about'],
      ['Contact', '/contact'],
      ['Affiliate disclosure', '/affiliate-disclosure'],
      ['Privacy policy', '/privacy-policy'],
      ['Terms & conditions', '/terms'],
    ],
  },
];

export default function Footer({ socialLinks }: { socialLinks?: WebsiteSettings['social_links'] }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const socials = [
    { href: socialLinks?.telegram, label: 'Telegram', Icon: Send },
    { href: socialLinks?.instagram, label: 'Instagram', Icon: Instagram },
    { href: socialLinks?.twitter, label: 'X (Twitter)', Icon: XIcon },
    { href: socialLinks?.facebook, label: 'Facebook', Icon: Facebook },
  ].filter((s): s is { href: string; label: string; Icon: typeof Send } => Boolean(s.href));

  return (
    <footer className="mt-auto bg-ink text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Handpicked products and price drops from India&apos;s favourite online stores, in one easy place to
              browse.
            </p>
            {socials.length > 0 && (
              <ul className="mt-6 flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`SimpleXplore on ${label}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-soft text-white transition-colors hover:bg-brand-600"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">{col.title}</h2>
                <ul className="mt-4 space-y-1">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="inline-flex min-h-[36px] items-center text-sm hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-ink-line p-5 text-xs leading-relaxed text-white/55">
          <p className="font-semibold text-white/80">Affiliate disclosure</p>
          <p className="mt-1">
            SimpleXplore is a product discovery platform, not a store. We don&apos;t process payments, hold stock or
            ship orders. When you buy through links on this site we may earn a commission, at no extra cost to you.
            Prices and availability are set by retailers and can change at any time.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-ink-line pt-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} SimpleXplore. All rights reserved.</p>
          <p>Shop Smart • Explore More</p>
        </div>
      </div>
    </footer>
  );
}
