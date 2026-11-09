import { serializeJsonLd } from '@/lib/seo';

export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escaped by serializeJsonLd — safe for untrusted product text.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
