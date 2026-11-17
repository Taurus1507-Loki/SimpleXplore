'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { useSiteSettings } from './SiteSettingsContext';
import { getSocialItems } from './SocialLinks';
import type { WebsiteSettings } from '@/types';

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
      ['About us', '/about'],
      ['Contact', '/contact'],
      ['Affiliate disclosure', '/affiliate-disclosure'],
      ['Privacy policy', '/privacy-policy'],
      ['Terms & conditions', '/terms'],
    ],
  },
];

export default function Footer({ socialLinks }: { socialLinks?: WebsiteSettings['social_links'] }) {
  const pathname = usePathname();
  const site = useSiteSettings();

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const socials = getSocialItems(socialLinks);

  return (
    <footer className="mt-auto bg-ink text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Handpicked products and price drops from India&apos;s favourite online stores, in one easy place to browse.
            </p>
            {socials.length > 0 && (
              <ul className="mt-6 flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.siteName} on ${label}`}
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
          {/* Text comes from Admin → Website Settings → Affiliate disclosure. */}
          <p className="mt-1 whitespace-pre-line">{site.affiliateDisclosure}</p>
          <p className="mt-2">Prices and availability are set by retailers and can change at any time.</p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-ink-line pt-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.siteName}. All rights reserved.</p>
          {site.tagline && <p>{site.tagline}</p>}
        </div>
      </div>
    </footer>
  );
}
