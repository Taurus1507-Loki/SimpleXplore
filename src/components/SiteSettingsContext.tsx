'use client';

import { createContext, useContext } from 'react';

/** The public part of Website Settings that client components need (never secrets). */
export interface PublicSiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  contactEmail: string;
  affiliateDisclosure: string;
}

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  siteName: 'SimpleXplore',
  tagline: 'Shop Smart • Explore More',
  logoUrl: null,
  contactEmail: 'support@simplexplore.com',
  affiliateDisclosure:
    'SimpleXplore is a product discovery platform, not a store. When you buy through links on this site we may earn a commission, at no extra cost to you.',
};

const SiteSettingsContext = createContext<PublicSiteSettings>(DEFAULT_SITE_SETTINGS);

export const SiteSettingsProvider = SiteSettingsContext.Provider;

export function useSiteSettings(): PublicSiteSettings {
  return useContext(SiteSettingsContext);
}
