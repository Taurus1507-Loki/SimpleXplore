import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Questions about a product, a price or a partnership? Get in touch with the SimpleXplore team.',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
