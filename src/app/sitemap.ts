import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // Only published products are ever listed — drafts stay private.
  const [categories, { products }] = await Promise.all([
    db.getCategories(),
    db.getProducts({ status: 'published' }),
  ]);

  const newest = products.reduce<Date>((latest, p) => {
    const d = new Date(p.updated_at || p.created_at);
    return d > latest ? d : latest;
  }, new Date(0));
  const catalogModified = newest.getTime() > 0 ? newest : new Date();

  const staticRoutes: Array<[string, MetadataRoute.Sitemap[number]['changeFrequency'], number, Date?]> = [
    ['', 'daily', 1.0, catalogModified],
    ['/products', 'daily', 0.9, catalogModified],
    ['/deals', 'daily', 0.9, catalogModified],
    ['/trending', 'daily', 0.8, catalogModified],
    ['/categories', 'weekly', 0.7],
    ['/about', 'yearly', 0.4],
    ['/contact', 'yearly', 0.4],
    ['/affiliate-disclosure', 'yearly', 0.3],
    ['/privacy-policy', 'yearly', 0.2],
    ['/terms', 'yearly', 0.2],
  ];

  return [
    ...staticRoutes.map(([path, changeFrequency, priority, lastModified]) => ({
      url: `${baseUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    ...categories.map((cat) => ({
      url: `${baseUrl}/categories/${cat.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...products.map((prod) => ({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: new Date(prod.updated_at || prod.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
