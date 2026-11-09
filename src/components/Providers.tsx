'use client';

import { MotionConfig } from 'framer-motion';
import { WishlistProvider } from './WishlistContext';
import { SiteSettingsProvider, type PublicSiteSettings } from './SiteSettingsContext';

/**
 * Client providers. `reducedMotion="user"` makes every Framer Motion
 * animation honour the OS "reduce motion" setting automatically.
 */
export default function Providers({
  children,
  accountKey,
  site,
}: {
  children: React.ReactNode;
  accountKey: string | null;
  site: PublicSiteSettings;
}) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <SiteSettingsProvider value={site}>
        <WishlistProvider accountKey={accountKey}>{children}</WishlistProvider>
      </SiteSettingsProvider>
    </MotionConfig>
  );
}
