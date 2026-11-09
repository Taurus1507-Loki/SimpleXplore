import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import JsonLd from '@/components/JsonLd';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { generatePalette } from '@/lib/utils/colors';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const sans = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

/** Site-wide metadata follows Admin → Website Settings (brand name and tagline). */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.getSettings();
  const name = settings.site_name || SITE_NAME;
  const tagline = settings.tagline || SITE_TAGLINE;
  const full = `${name} — ${tagline}`;
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: full, template: `%s | ${name}` },
    description: SITE_DESCRIPTION,
    applicationName: name,
    keywords: [
      'shopping deals India',
      'best price drops today',
      'Amazon India deals',
      'Flipkart offers',
      'Myntra sale',
      'trending products India',
      'product discovery',
    ],
    openGraph: { title: full, description: SITE_DESCRIPTION, siteName: name, url: '/', locale: 'en_IN', type: 'website' },
    twitter: { card: 'summary_large_image', title: full, description: SITE_DESCRIPTION },
    icons: settings.logo_url ? { icon: settings.logo_url, apple: settings.logo_url } : undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    formatDetection: { telephone: false },
    category: 'shopping',
  };
}

export const viewport: Viewport = {
  themeColor: '#106B36',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, adminSession] = await Promise.all([db.getSettings(), getAdminSession()]);
  const primaryColor = settings?.primary_color || '#168A45';
  const palette = generatePalette(primaryColor);
  const cssVars = Object.entries(palette)
    .map(([shade, hex]) => `--brand-${shade}: ${hex};`)
    .join(' ');

  // Display-only hint; admin status comes solely from the signed session.
  const hintedEmail = cookies().get('sx_user_email')?.value;
  const initialEmail = adminSession?.email ?? (hintedEmail ? decodeURIComponent(hintedEmail) : null);

  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <head>
        <style
          id="sx-dynamic-theme"
          dangerouslySetInnerHTML={{
            __html: `:root { ${cssVars} }`,
          }}
        />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-bg text-copy-primary font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <JsonLd data={organizationJsonLd({ name: settings.site_name || SITE_NAME, tagline: settings.tagline, logoUrl: settings.logo_url })} />
        <JsonLd data={websiteJsonLd({ name: settings.site_name || SITE_NAME })} />
        <Providers
          accountKey={initialEmail}
          site={{
            siteName: settings.site_name || SITE_NAME,
            tagline: settings.tagline ?? SITE_TAGLINE,
            logoUrl: settings.logo_url || null,
            contactEmail: settings.contact_email,
            affiliateDisclosure: settings.affiliate_disclosure,
          }}
        >
          <Header initialEmail={initialEmail} initialIsAdmin={Boolean(adminSession)} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer socialLinks={settings.social_links} />
        </Providers>
      </body>
    </html>
  );
}
