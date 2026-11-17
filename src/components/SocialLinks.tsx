'use client';

import React from 'react';
import { Send, Instagram, Facebook } from 'lucide-react';
import type { WebsiteSettings } from '@/types';

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.8-6.3L6.4 22H3.3l7.3-8.3L1 2h6.3l4.4 5.8L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
    </svg>
  );
}

export function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.18-5.01 1.18-5.01s-.3-.6-.3-1.49c0-1.4.81-2.44 1.82-2.44.86 0 1.27.64 1.27 1.42 0 .86-.55 2.15-.83 3.35-.24 1 .5 1.82 1.49 1.82 1.78 0 3.16-1.88 3.16-4.59 0-2.4-1.72-4.08-4.19-4.08-2.85 0-4.53 2.14-4.53 4.35 0 .86.33 1.79.75 2.29.08.1.09.19.07.29-.08.32-.25 1-.28 1.14-.04.18-.14.22-.33.13-1.25-.58-2.03-2.41-2.03-3.88 0-3.16 2.3-6.06 6.62-6.06 3.48 0 6.18 2.48 6.18 5.79 0 3.45-2.18 6.23-5.2 6.23-1.01 0-1.97-.53-2.3-1.15l-.62 2.38c-.23.87-.84 1.97-1.25 2.64.94.29 1.94.45 2.98.45 5.52 0 10-4.48 10-10S17.52 2 12 2Z" />
    </svg>
  );
}

export function getSocialItems(socialLinks?: WebsiteSettings['social_links']) {
  return [
    { href: socialLinks?.telegram, label: 'Telegram', Icon: Send },
    { href: socialLinks?.instagram, label: 'Instagram', Icon: Instagram },
    { href: socialLinks?.twitter, label: 'X (Twitter)', Icon: XIcon },
    { href: socialLinks?.facebook, label: 'Facebook', Icon: Facebook },
    { href: socialLinks?.pinterest, label: 'Pinterest', Icon: PinterestIcon },
  ].filter((s): s is { href: string; label: string; Icon: typeof Send } => Boolean(s.href));
}
