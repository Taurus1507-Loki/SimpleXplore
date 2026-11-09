import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { WishlistProvider } from '@/components/WishlistContext';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'SimpleXplore — Shop Smart • Explore More',
    template: '%s | SimpleXplore',
  },
  description: 'Discover trending products, compare shopping finds, and grab handpicked affiliate deals from Amazon, Flipkart, Myntra and top Indian retailers.',
  keywords: ['shopping deals India', 'affiliate discovery', 'Amazon deals', 'Flipkart offers', 'best discount products'],
  openGraph: {
    title: 'SimpleXplore — Shop Smart • Explore More',
    description: 'Find verified affiliate deals and trending lifestyle products in India.',
    siteName: 'SimpleXplore',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-surface-bg text-copy-primary">
        <WishlistProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  );
}

