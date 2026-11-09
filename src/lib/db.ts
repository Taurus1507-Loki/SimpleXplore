import { 
  Product, 
  Category, 
  TelegramImport, 
  AffiliateClick, 
  WebsiteSettings, 
  ProductStatus 
} from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';

import { isSupabaseConfigured } from '@/lib/supabase/config';

// -----------------------------------------------------------------------------
// INITIAL SEED DATA (Used in Demo Mode & Initial DB Seeding)
// -----------------------------------------------------------------------------
export const initialCategories: Category[] = [
  {
    id: 'cat-fashion',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing, apparel and styles for everyone',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'cat-womens-fashion',
    name: "Women's Fashion",
    slug: 'womens-fashion',
    parent_id: 'cat-fashion',
    description: 'Ethnic wear, western dresses, tops, kurtis and footwear',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'cat-mens-fashion',
    name: "Men's Fashion",
    slug: 'mens-fashion',
    parent_id: 'cat-fashion',
    description: 'Casual shirts, formal trousers, jackets and sneakers',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'cat-footwear',
    name: 'Footwear',
    slug: 'footwear',
    description: 'Comfortable sneakers, casual shoes, heels, running shoes and sandals',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Skincare serums, haircare, makeup and luxury fragrance',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 5,
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Noise cancelling headphones, smartwatches, gadgets and accessories',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 6,
  },
  {
    id: 'cat-home-kitchen',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Coffee makers, air fryers, kitchenware and modern home decor',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 7,
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Designer watches, UV polarized sunglasses, backpacks and leather wallets',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 8,
  },
  {
    id: 'cat-lifestyle',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Fitness trackers, travel essentials and ergonomic daily gear',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    sort_order: 9,
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-sony-wh1000xm5',
    title: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones',
    slug: 'sony-wh-1000xm5-wireless-anc-headphones',
    description: 'Industry-leading noise cancellation optimized with two processors and 8 microphones. Up to 30-hour battery life with quick charging. Crystal clear hands-free calling with 4 beamforming microphones.',
    highlights: [
      'Industry-leading noise cancellation with 8 microphones',
      'Ultra-comfortable, lightweight design with soft fit leather',
      'Up to 30-hour battery life (3 min charge gives 3 hours playback)',
      'Multipoint connection allows switching between devices seamlessly',
    ],
    category_id: 'cat-electronics',
    retailer: 'Amazon India',
    current_price: 26990,
    original_price: 34990,
    currency: 'INR',
    discount: 23,
    rating: 4.6,
    review_count: 14250,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    affiliate_url: 'https://www.amazon.in/dp/B09XS7JWHH?tag=simplexplore-21',
    featured: true,
    trending: true,
    status: 'published',
    source_type: 'manual',
    seo_title: 'Sony WH-1000XM5 Wireless Headphones Deal - SimpleXplore',
    seo_description: 'Discover the best deal on Sony WH-1000XM5 ANC headphones on Amazon India with ₹8,000 off.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prod-apple-ipad-10th',
    title: 'Apple iPad (10th Generation) with A14 Bionic Chip & Liquid Retina Display',
    slug: 'apple-ipad-10th-generation-a14-bionic',
    description: 'Colourfully reimagined and more versatile than ever with an all-screen design, 10.9-inch Liquid Retina display, and fast A14 Bionic chip. Available in vibrant finishes.',
    highlights: [
      'Striking 10.9-inch Liquid Retina display with True Tone',
      'A14 Bionic chip with 6-core CPU and 4-core GPU',
      '12MP Ultra Wide front camera with Center Stage',
      'Wi-Fi 6 connectivity and USB-C connector for fast transfers',
    ],
    category_id: 'cat-electronics',
    retailer: 'Flipkart',
    current_price: 33900,
    original_price: 39900,
    currency: 'INR',
    discount: 15,
    rating: 4.7,
    review_count: 8320,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    affiliate_url: 'https://www.flipkart.com/apple-ipad-10th-gen-64-gb-rom-10-9-inch-wi-fi-only/p/itm5a666e138a0c2?affid=simplexplore',
    featured: true,
    trending: true,
    status: 'published',
    source_type: 'manual',
    seo_title: 'Apple iPad 10th Gen Lowest Price Deal in India - SimpleXplore',
    seo_description: 'Buy Apple iPad 10th Generation online in India at discount price from Flipkart.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const initialTelegramImports: TelegramImport[] = [
  {
    id: 'tg-imp-1',
    telegram_update_id: 'upd-101',
    product_id: 'prod-draft-realme-earbuds',
    original_url: 'https://amzn.to/3xyz789',
    affiliate_url: 'https://www.amazon.in/dp/B0CKZDFQ3W?tag=simplexplore-21',
    extracted_data: {
      title: 'realme Buds Air 5 Pro Truly Wireless in-Ear Earbuds with 50dB ANC',
      description: 'Hi-Res Audio with LDAC support, 50dB active noise cancellation, 40 hours total playback time, and 360-degree spatial audio effect.',
      price: 4999,
      original_price: 7999,
      discount: 38,
      retailer: 'Amazon India',
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      category: 'Electronics',
      rating: 4.3,
      review_count: 5200,
      highlights: [
        '50dB Active Noise Cancellation with dual mic',
        'Coaxial dual driver system (11mm bass + 6mm micro-planar tweeter)',
        'LDAC certified high-resolution wireless streaming',
      ],
      raw_message: '🔥 Huge price drop! realme Buds Air 5 Pro ANC Earbuds at just ₹4,999 (was ₹7,999). Limited time deal: https://amzn.to/3xyz789',
    },
    extraction_status: 'success',
    review_status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'tg-imp-2',
    telegram_update_id: 'upd-102',
    product_id: 'prod-draft-crocs-clogs',
    original_url: 'https://fkrt.it/shoes123',
    affiliate_url: 'https://www.flipkart.com/crocs-classic-clogs/p/itm29834190?affid=simplexplore',
    extracted_data: {
      title: 'Crocs Classic Unisex Navy Blue Clogs',
      description: 'Iconic lightweight Crocs Comfort with ventilation ports and pivoting heel straps for a secure fit.',
      price: 1995,
      original_price: 3495,
      discount: 43,
      retailer: 'Flipkart',
      image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
      category: 'Footwear',
      rating: 4.6,
      review_count: 14200,
      highlights: ['Water-friendly and buoyant', 'Ventilation ports add breathability', 'Easy to clean and quick to dry'],
      raw_message: 'Best deal on footwear today! Crocs Classic Clogs at 43% OFF on Flipkart: https://fkrt.it/shoes123',
    },
    extraction_status: 'success',
    review_status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const initialSettings: WebsiteSettings = {
  id: 'settings-default',
  site_name: 'SimpleXplore',
  tagline: 'Shop Smart • Explore More',
  primary_color: '#168A45',
  default_currency: 'INR',
  contact_email: 'support@simplexplore.com',
  social_links: {
    twitter: 'https://twitter.com/simplexplore',
    telegram: 'https://t.me/simplexplore_deals',
    instagram: 'https://instagram.com/simplexplore',
  },
  affiliate_disclosure: 'SimpleXplore is a reader-supported shopping discovery platform. When you buy through affiliate links on our site, we may earn an affiliate commission at no additional cost to you. Product prices and availability are accurate as of the date/time indicated and are subject to change by retailer.',
  homepage_config: {
    show_hero: true,
    show_trending: true,
    show_deals: true,
    show_categories: true,
  },
  telegram_config: {
    auto_import: true,
    default_channel: '@simplexplore_deals',
  },
  updated_at: new Date().toISOString(),
};

// -----------------------------------------------------------------------------
// SUPABASE HELPERS
// -----------------------------------------------------------------------------
type SupabaseAdmin = ReturnType<typeof createAdminClient>;
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Every primary/foreign key in the Supabase schema is a UUID. */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

/** Columns of `public.products` that callers may write. Anything else is dropped. */
const PRODUCT_WRITABLE_COLUMNS = [
  'title', 'slug', 'description', 'highlights', 'category_id', 'retailer',
  'current_price', 'original_price', 'currency', 'discount', 'rating', 'review_count',
  'image_url', 'affiliate_url', 'featured', 'trending', 'status', 'source_type',
  'seo_title', 'seo_description',
] as const;

/** Whitelists product fields for an insert/update. Non-UUID category ids (demo ids) become null. */
export function toProductRow(input: Partial<Product>): Row {
  const row: Row = {};
  const src = input as Row;
  for (const key of PRODUCT_WRITABLE_COLUMNS) {
    if (src[key] !== undefined) row[key] = src[key];
  }
  if ('category_id' in row && row.category_id !== null && !isUuid(row.category_id)) {
    row.category_id = null;
  }
  return row;
}

/** Columns of `public.website_settings` that admins may change. */
const SETTINGS_WRITABLE_COLUMNS = [
  'site_name', 'tagline', 'primary_color', 'default_currency', 'contact_email',
  'social_links', 'affiliate_disclosure', 'homepage_config', 'telegram_config',
] as const;

function toSettingsRow(input: Partial<WebsiteSettings>): Row {
  const row: Row = {};
  const src = input as Row;
  for (const key of SETTINGS_WRITABLE_COLUMNS) {
    if (src[key] !== undefined) row[key] = src[key];
  }
  return row;
}

/** Fills NULL JSONB columns so the UI never reads properties of null. Scalar columns are NOT NULL in the schema. */
function mapSettingsRow(row: Row): WebsiteSettings {
  return {
    ...(row as WebsiteSettings),
    social_links: row.social_links ?? {},
    homepage_config: row.homepage_config ?? initialSettings.homepage_config,
    telegram_config: row.telegram_config ?? initialSettings.telegram_config,
  };
}

function mapImportRow(row: Row): TelegramImport {
  const { product, ...rest } = row;
  return {
    ...(rest as TelegramImport),
    extracted_data: rest.extracted_data ?? {},
    product: product ?? undefined,
  };
}

function slugifyTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// -----------------------------------------------------------------------------
// ANALYTICS
// -----------------------------------------------------------------------------
export interface ProductClickStat {
  productId: string;
  title: string | null;
  retailer: string | null;
  clicks: number;
}

export interface AnalyticsSummary {
  totalProducts: number;
  publishedProducts: number;
  pendingDrafts: number;
  totalTelegramImports: number;
  pendingReviewImports: number;
  totalClicks: number;
  clicksByRetailer: Record<string, number>;
  /** Sorted by clicks, highest first. */
  clicksByProduct: ProductClickStat[];
  /** One entry per UTC day that had clicks, oldest first. */
  clicksByDate: { date: string; clicks: number }[];
  /** Referrer hostname -> clicks. Clicks without a referrer count as "direct". */
  trafficSources: Record<string, number>;
  /** utm_campaign / ref value -> clicks. */
  clicksByCampaign: Record<string, number>;
}

type ClickForStats = Pick<AffiliateClick, 'product_id' | 'retailer' | 'referrer' | 'campaign' | 'timestamp'>;

export function trafficSourceOf(referrer?: string | null): string {
  if (!referrer) return 'direct';
  try {
    return new URL(referrer).hostname.replace(/^www\./, '') || 'unknown';
  } catch {
    return 'unknown';
  }
}

/** Pure aggregation over recorded clicks; shared by Supabase and demo mode. */
export function aggregateClicks(
  clicks: ClickForStats[],
  titles: Map<string, string> = new Map()
): Pick<AnalyticsSummary, 'totalClicks' | 'clicksByRetailer' | 'clicksByProduct' | 'clicksByDate' | 'trafficSources' | 'clicksByCampaign'> {
  const clicksByRetailer: Record<string, number> = {};
  const byProduct = new Map<string, ProductClickStat>();
  const byDate: Record<string, number> = {};
  const trafficSources: Record<string, number> = {};
  const clicksByCampaign: Record<string, number> = {};

  for (const c of clicks) {
    if (c.retailer) clicksByRetailer[c.retailer] = (clicksByRetailer[c.retailer] || 0) + 1;

    const stat = byProduct.get(c.product_id) ?? {
      productId: c.product_id,
      title: titles.get(c.product_id) ?? null,
      retailer: c.retailer ?? null,
      clicks: 0,
    };
    stat.clicks += 1;
    byProduct.set(c.product_id, stat);

    const day = c.timestamp ? new Date(c.timestamp).toISOString().slice(0, 10) : null;
    if (day) byDate[day] = (byDate[day] || 0) + 1;

    const source = trafficSourceOf(c.referrer);
    trafficSources[source] = (trafficSources[source] || 0) + 1;

    if (c.campaign) clicksByCampaign[c.campaign] = (clicksByCampaign[c.campaign] || 0) + 1;
  }

  return {
    totalClicks: clicks.length,
    clicksByRetailer,
    clicksByProduct: Array.from(byProduct.values()).sort((a, b) => b.clicks - a.clicks),
    clicksByDate: Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, n]) => ({ date, clicks: n })),
    trafficSources,
    clicksByCampaign,
  };
}

const SUPABASE_PAGE_SIZE = 1000; // PostgREST default max rows per request

// In-Memory store for demo mode & dynamic state
class DataRepository {
  private categories: Category[] = [...initialCategories];
  private products: Product[] = [...initialProducts];
  private telegramImports: TelegramImport[] = [...initialTelegramImports];
  private affiliateClicks: AffiliateClick[] = [];
  private settings: WebsiteSettings = { ...initialSettings };
  private wishlists: Record<string, string[]> = {}; // userId -> productIds[]
  private processedTelegramUpdates = new Set<number>(); // demo-mode webhook idempotency

  constructor() {
    // Add pending draft products from initial Telegram imports to the products table with status 'draft'
    for (const imp of this.telegramImports) {
      if (imp.product_id && imp.extracted_data.title) {
        this.products.push({
          id: imp.product_id,
          title: imp.extracted_data.title,
          slug: imp.extracted_data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: imp.extracted_data.description || null,
          highlights: imp.extracted_data.highlights || null,
          category_id: 'cat-electronics',
          retailer: imp.extracted_data.retailer || 'Amazon India',
          current_price: imp.extracted_data.price ?? 0,
          original_price: imp.extracted_data.original_price || null,
          currency: 'INR',
          discount: imp.extracted_data.discount ?? null,
          rating: imp.extracted_data.rating ?? null,
          review_count: imp.extracted_data.review_count ?? null,
          image_url: imp.extracted_data.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          affiliate_url: imp.affiliate_url,
          featured: false,
          trending: false,
          status: 'draft', // CRITICAL RULE: Telegram imports MUST remain drafts!
          source_type: 'telegram',
          created_at: imp.created_at,
        });
      }
    }
  }

  /** Supabase client when real credentials are configured, otherwise null (demo mode). */
  private supabase(): SupabaseAdmin | null {
    return isSupabaseConfigured() ? createAdminClient() : null;
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Fallback to local categories store:', e);
      }
    }
    return this.categories.filter(c => c.is_active);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find(c => c.slug === slug) || null;
  }

  // --- PRODUCTS ---
  async getProducts(params?: {
    status?: ProductStatus | 'all';
    categorySlug?: string;
    categoryId?: string;
    retailer?: string;
    search?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    isDeals?: boolean;
    limit?: number;
    offset?: number;
    sort?: 'newest' | 'price_low' | 'price_high' | 'discount' | 'rating';
  }): Promise<{ products: Product[]; total: number }> {
    const status = params?.status || 'published';

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        let query = supabase.from('products').select('*, category:categories(*)', { count: 'exact' });

        if (status !== 'all') query = query.eq('status', status);
        if (params?.categoryId) query = query.eq('category_id', params.categoryId);
        if (params?.retailer) query = query.eq('retailer', params.retailer);
        if (params?.isFeatured) query = query.eq('featured', true);
        if (params?.isTrending) query = query.eq('trending', true);
        if (params?.search) query = query.ilike('title', `%${params.search}%`);

        if (params?.sort === 'price_low') query = query.order('current_price', { ascending: true });
        else if (params?.sort === 'price_high') query = query.order('current_price', { ascending: false });
        else if (params?.sort === 'discount') query = query.order('discount', { ascending: false });
        else if (params?.sort === 'rating') query = query.order('rating', { ascending: false });
        else query = query.order('created_at', { ascending: false });

        if (params?.limit) query = query.limit(params.limit);

        const { data, count, error } = await query;
        if (!error && data) {
          return { products: data as Product[], total: count || data.length };
        }
      } catch (e) {
        console.warn('Supabase query error, fallback to local store:', e);
      }
    }

    // Local / In-memory filtering
    let list = this.products.filter(p => (status === 'all' ? true : p.status === status));

    if (params?.categorySlug) {
      const cat = this.categories.find(c => c.slug === params.categorySlug);
      if (cat) {
        list = list.filter(p => p.category_id === cat.id);
      }
    }

    if (params?.categoryId) {
      list = list.filter(p => p.category_id === params.categoryId);
    }

    if (params?.retailer) {
      list = list.filter(p => p.retailer.toLowerCase() === params.retailer?.toLowerCase());
    }

    if (params?.isFeatured) {
      list = list.filter(p => p.featured);
    }

    if (params?.isTrending) {
      list = list.filter(p => p.trending);
    }

    if (params?.isDeals) {
      list = list.filter(p => (p.discount || 0) >= 15);
    }

    if (params?.search) {
      const query = params.search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.retailer.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (params?.sort === 'price_low') {
      list.sort((a, b) => a.current_price - b.current_price);
    } else if (params?.sort === 'price_high') {
      list.sort((a, b) => b.current_price - a.current_price);
    } else if (params?.sort === 'discount') {
      list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (params?.sort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Populate category object
    const populated = list.map(p => ({
      ...p,
      category: this.categories.find(c => c.id === p.category_id) || null,
    }));

    const offset = params?.offset || 0;
    const limit = params?.limit ? offset + params.limit : undefined;
    const paginated = limit ? populated.slice(offset, limit) : populated;

    return { products: paginated, total: populated.length };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Product;
      } catch (e) {
        console.warn('Fallback to local product lookup:', e);
      }
    }
    const found = this.products.find(p => p.slug === slug);
    if (!found) return null;
    return {
      ...found,
      category: this.categories.find(c => c.id === found.category_id) || null,
    };
  }

  /** Public lookup: only returns published products (drafts are never public). */
  async getPublishedProductBySlug(slug: string): Promise<Product | null> {
    const product = await this.getProductBySlug(slug);
    return product && product.status === 'published' ? product : null;
  }

  async getProductById(id: string): Promise<Product | null> {
    const sb = this.supabase();
    if (sb) {
      if (!isUuid(id)) return null; // would be a Postgres cast error
      const { data, error } = await sb
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('Supabase product lookup error:', error.message);
        return null;
      }
      return (data as Product) ?? null;
    }

    const found = this.products.find(p => p.id === id);
    if (!found) return null;
    return {
      ...found,
      category: this.categories.find(c => c.id === found.category_id) || null,
    };
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const newProduct: Product = {
      id: data.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title || 'Untitled Product',
      slug: data.slug || `product-${Date.now()}`,
      description: data.description || null,
      highlights: data.highlights || [],
      category_id: data.category_id || null,
      retailer: data.retailer || 'Online Retailer',
      current_price: data.current_price || 0,
      original_price: data.original_price || null,
      currency: data.currency || 'INR',
      discount: data.discount || 0,
      rating: data.rating ?? null,
      review_count: data.review_count ?? null,
      image_url: data.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      affiliate_url: data.affiliate_url || '#',
      featured: data.featured || false,
      trending: data.trending || false,
      status: data.status || 'draft',
      source_type: data.source_type || 'manual',
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      images: data.images || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const sb = this.supabase();
    if (sb) {
      // Let Postgres generate the UUID unless the caller supplied a valid one.
      const row = toProductRow(newProduct);
      if (isUuid(data.id)) row.id = data.id;
      const { data: inserted, error } = await sb
        .from('products')
        .insert(row)
        .select('*, category:categories(*)')
        .single();
      if (error || !inserted) {
        throw new Error(`Failed to save product: ${error?.message ?? 'no row returned'}`);
      }
      return inserted as Product;
    }

    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const sb = this.supabase();
    if (sb) {
      if (!isUuid(id)) return null;
      const { data, error } = await sb
        .from('products')
        .update({ ...toProductRow(updates), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, category:categories(*)')
        .maybeSingle();
      if (error) throw new Error(`Failed to update product: ${error.message}`);
      return (data as Product) ?? null;
    }

    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.products[index] = {
      ...this.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const sb = this.supabase();
    if (sb) {
      if (!isUuid(id)) return false;
      const { data, error } = await sb.from('products').delete().eq('id', id).select('id');
      if (error) throw new Error(`Failed to delete product: ${error.message}`);
      return (data?.length ?? 0) > 0;
    }

    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  // --- TELEGRAM UPDATES (webhook idempotency) ---

  /**
   * Records a Telegram update before it is processed. Returns `claimed: false` when this
   * update_id was already seen, so retries/duplicate deliveries are never processed twice.
   * In Supabase mode the guarantee comes from the UNIQUE constraint on telegram_updates.update_id.
   */
  async claimTelegramUpdate(update: {
    update_id: number;
    channel_id: string;
    message_id: number;
    message_text?: string | null;
    original_urls?: string[];
  }): Promise<{ claimed: boolean; id?: string }> {
    const sb = this.supabase();
    if (sb) {
      const { data, error } = await sb
        .from('telegram_updates')
        .insert({
          update_id: update.update_id,
          channel_id: update.channel_id,
          message_id: update.message_id,
          message_text: update.message_text ?? null,
          original_urls: update.original_urls ?? [],
          processing_status: 'pending',
        })
        .select('id')
        .single();
      if (error) {
        if (error.code === '23505') return { claimed: false }; // unique_violation: already seen
        throw new Error(`Failed to record Telegram update: ${error.message}`);
      }
      return { claimed: true, id: data?.id };
    }

    if (this.processedTelegramUpdates.has(update.update_id)) return { claimed: false };
    this.processedTelegramUpdates.add(update.update_id);
    if (this.processedTelegramUpdates.size > 10000) {
      // Keep memory bounded
      Array.from(this.processedTelegramUpdates).slice(0, 5000).forEach(id => this.processedTelegramUpdates.delete(id));
    }
    return { claimed: true };
  }

  async setTelegramUpdateStatus(updateId: number, status: 'processed' | 'failed' | 'ignored'): Promise<void> {
    const sb = this.supabase();
    if (!sb) return;
    const { error } = await sb.from('telegram_updates').update({ processing_status: status }).eq('update_id', updateId);
    if (error) console.error('Failed to update Telegram update status:', error.message);
  }

  /** Accepts a telegram_updates UUID, or `upd-<update_id>` / `<update_id>` as produced by the Telegram service. */
  private async resolveTelegramUpdateRef(sb: SupabaseAdmin, ref?: string | null): Promise<string | null> {
    if (!ref) return null;
    if (isUuid(ref)) return ref;
    const match = /^(?:upd-)?(\d+)$/.exec(ref);
    if (!match) return null;
    const { data, error } = await sb
      .from('telegram_updates')
      .select('id')
      .eq('update_id', Number(match[1]))
      .maybeSingle();
    if (error) {
      console.error('Failed to resolve Telegram update reference:', error.message);
      return null;
    }
    return data?.id ?? null;
  }

  // --- TELEGRAM IMPORTS ---
  async getTelegramImports(filter?: { review_status?: string; extraction_status?: string }): Promise<TelegramImport[]> {
    const sb = this.supabase();
    if (sb) {
      let query = sb.from('telegram_imports').select('*, product:products(*)');
      if (filter?.review_status && filter.review_status !== 'all') query = query.eq('review_status', filter.review_status);
      if (filter?.extraction_status && filter.extraction_status !== 'all') query = query.eq('extraction_status', filter.extraction_status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase telegram imports query error:', error.message);
        return [];
      }
      return (data ?? []).map(mapImportRow);
    }

    let list = [...this.telegramImports];
    if (filter?.review_status && filter.review_status !== 'all') {
      list = list.filter(i => i.review_status === filter.review_status);
    }
    if (filter?.extraction_status && filter.extraction_status !== 'all') {
      list = list.filter(i => i.extraction_status === filter.extraction_status);
    }
    // Attach product reference
    return list.map(item => ({
      ...item,
      product: this.products.find(p => p.id === item.product_id) || undefined,
    }));
  }

  async getTelegramImportById(id: string): Promise<TelegramImport | null> {
    const sb = this.supabase();
    if (sb) {
      if (!isUuid(id)) return null;
      const { data, error } = await sb
        .from('telegram_imports')
        .select('*, product:products(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('Supabase telegram import lookup error:', error.message);
        return null;
      }
      return data ? mapImportRow(data) : null;
    }

    const item = this.telegramImports.find(i => i.id === id);
    if (!item) return null;
    return {
      ...item,
      product: this.products.find(p => p.id === item.product_id) || undefined,
    };
  }

  async createTelegramImport(data: Partial<TelegramImport>): Promise<TelegramImport> {
    const sb = this.supabase();
    if (sb) {
      const row = {
        telegram_update_id: await this.resolveTelegramUpdateRef(sb, data.telegram_update_id),
        product_id: isUuid(data.product_id) ? data.product_id : null,
        original_url: data.original_url || '',
        affiliate_url: data.affiliate_url || '',
        extracted_data: data.extracted_data || {},
        extraction_status: data.extraction_status || 'partial',
        error_message: data.error_message || null,
        review_status: 'pending', // Strictly pending! Imports are never auto-approved.
      };
      const { data: inserted, error } = await sb.from('telegram_imports').insert(row).select('*').single();
      if (error || !inserted) {
        throw new Error(`Failed to save Telegram import: ${error?.message ?? 'no row returned'}`);
      }
      return mapImportRow(inserted);
    }

    const id = data.id || `tg-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newImport: TelegramImport = {
      id,
      telegram_update_id: data.telegram_update_id || null,
      product_id: data.product_id || null,
      original_url: data.original_url || '',
      affiliate_url: data.affiliate_url || '',
      extracted_data: data.extracted_data || {},
      extraction_status: data.extraction_status || 'partial',
      error_message: data.error_message || null,
      review_status: 'pending', // Strictly pending!
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.telegramImports.unshift(newImport);
    return newImport;
  }

  private async findCategoryIdByName(sb: SupabaseAdmin, name?: string): Promise<string | null> {
    if (!name) return null;
    const { data, error } = await sb.from('categories').select('id, name').ilike('name', name).limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0].id ?? null;
  }

  /** Supabase implementation of the admin "Approve & Publish" action. */
  private async approveAndPublishInSupabase(
    sb: SupabaseAdmin,
    importId: string,
    editedData?: Partial<Product>
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    if (!isUuid(importId)) return { success: false, error: 'Telegram import record not found' };

    const { data: item, error: fetchError } = await sb
      .from('telegram_imports')
      .select('*')
      .eq('id', importId)
      .maybeSingle();
    if (fetchError) return { success: false, error: fetchError.message };
    if (!item) return { success: false, error: 'Telegram import record not found' };

    const extracted: TelegramImport['extracted_data'] = item.extracted_data ?? {};
    let product: Product | null;

    if (item.product_id) {
      // Publish the existing draft, applying the admin's edits.
      product = await this.updateProduct(item.product_id, { ...editedData, status: 'published' });
      if (!product) return { success: false, error: 'Linked draft product no longer exists' };
    } else {
      // No draft yet (e.g. extraction failed). Only publish with real values: never invent them.
      const title = editedData?.title || extracted.title;
      const price = editedData?.current_price ?? extracted.price;
      const imageUrl = editedData?.image_url || extracted.image_url;
      const retailer = editedData?.retailer || extracted.retailer;
      if (!title) return { success: false, error: 'A product title is required before publishing' };
      if (price === undefined || price === null || !(Number(price) > 0)) {
        return { success: false, error: 'A product price is required before publishing' };
      }
      if (!imageUrl) return { success: false, error: 'A product image is required before publishing' };
      if (!retailer) return { success: false, error: 'A retailer is required before publishing' };

      product = await this.createProduct({
        title,
        // Import id suffix keeps the slug unique and deterministic.
        slug: editedData?.slug || `${slugifyTitle(title) || 'product'}-${importId.slice(0, 8)}`,
        description: editedData?.description ?? extracted.description ?? null,
        highlights: editedData?.highlights ?? extracted.highlights ?? [],
        retailer,
        current_price: Number(price),
        original_price: editedData?.original_price ?? extracted.original_price ?? null,
        discount: editedData?.discount ?? extracted.discount ?? null,
        rating: editedData?.rating ?? extracted.rating ?? null,
        review_count: editedData?.review_count ?? extracted.review_count ?? null,
        currency: editedData?.currency || 'INR',
        image_url: imageUrl,
        // Keep the link exactly as posted in Telegram so affiliate tracking is preserved.
        affiliate_url: editedData?.affiliate_url || item.original_url || item.affiliate_url,
        category_id: editedData?.category_id ?? (await this.findCategoryIdByName(sb, extracted.category)),
        seo_title: editedData?.seo_title ?? null,
        seo_description: editedData?.seo_description ?? null,
        status: 'published', // Admin explicitly clicked Approve & Publish
        source_type: 'telegram',
      });
    }

    const { error: updateError } = await sb
      .from('telegram_imports')
      .update({ review_status: 'approved', product_id: product.id, updated_at: new Date().toISOString() })
      .eq('id', importId);
    if (updateError) {
      return { success: false, product, error: `Product published but import status not saved: ${updateError.message}` };
    }

    return { success: true, product };
  }

  async approveAndPublishTelegramImport(importId: string, editedData?: Partial<Product>): Promise<{ success: boolean; product?: Product; error?: string }> {
    const sb = this.supabase();
    if (sb) {
      try {
        return await this.approveAndPublishInSupabase(sb, importId, editedData);
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    }

    const itemIndex = this.telegramImports.findIndex(i => i.id === importId);
    if (itemIndex === -1) {
      return { success: false, error: 'Telegram import record not found' };
    }

    const item = this.telegramImports[itemIndex];
    let product = this.products.find(p => p.id === item.product_id);

    if (!product) {
      // Create product if not already created
      product = await this.createProduct({
        title: editedData?.title || item.extracted_data.title || 'Imported Product',
        slug: editedData?.slug || (item.extracted_data.title || 'imported-product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: editedData?.description || item.extracted_data.description,
        highlights: editedData?.highlights || item.extracted_data.highlights,
        retailer: editedData?.retailer || item.extracted_data.retailer || 'Online Retailer',
        current_price: editedData?.current_price ?? (item.extracted_data.price || 0),
        original_price: editedData?.original_price ?? item.extracted_data.original_price,
        discount: editedData?.discount ?? item.extracted_data.discount,
        currency: 'INR',
        image_url: editedData?.image_url || item.extracted_data.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        affiliate_url: editedData?.affiliate_url || item.affiliate_url,
        category_id: editedData?.category_id || 'cat-electronics',
        status: 'published', // Admin explicitly clicked Approve & Publish
        source_type: 'telegram',
      });
      item.product_id = product.id;
    } else {
      // Update existing draft to published
      await this.updateProduct(product.id, {
        ...editedData,
        status: 'published',
      });
      product = (await this.getProductById(product.id))!;
    }

    this.telegramImports[itemIndex].review_status = 'approved';
    this.telegramImports[itemIndex].updated_at = new Date().toISOString();

    return { success: true, product };
  }

  async rejectTelegramImport(importId: string): Promise<boolean> {
    const sb = this.supabase();
    if (sb) {
      if (!isUuid(importId)) return false;
      const { data, error } = await sb
        .from('telegram_imports')
        .update({ review_status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', importId)
        .select('id');
      if (error) {
        console.error('Supabase telegram import reject error:', error.message);
        return false;
      }
      return (data?.length ?? 0) > 0;
    }

    const itemIndex = this.telegramImports.findIndex(i => i.id === importId);
    if (itemIndex === -1) return false;
    this.telegramImports[itemIndex].review_status = 'rejected';
    this.telegramImports[itemIndex].updated_at = new Date().toISOString();
    return true;
  }

  // --- AFFILIATE CLICKS & ANALYTICS ---
  async trackAffiliateClick(data: {
    productId: string;
    referrer?: string;
    campaign?: string;
    sessionId?: string;
    userAgent?: string;
  }): Promise<AffiliateClick> {
    const product = await this.getProductById(data.productId);
    const click: AffiliateClick = {
      id: `click-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      product_id: data.productId,
      timestamp: new Date().toISOString(),
      referrer: data.referrer || null,
      campaign: data.campaign || null,
      session_id: data.sessionId || null,
      retailer: product?.retailer || 'Unknown',
      user_agent: data.userAgent || null,
    };

    const sb = this.supabase();
    if (sb) {
      // id is generated by Postgres (UUID).
      const { id: _localId, ...row } = click; // eslint-disable-line @typescript-eslint/no-unused-vars
      const { data: inserted, error } = await sb.from('affiliate_clicks').insert(row).select('id').single();
      if (error) {
        console.error('Supabase click tracking error:', error.message);
        return click;
      }
      return { ...click, id: inserted?.id ?? click.id };
    }

    this.affiliateClicks.unshift(click);
    return click;
  }

  private async getAnalyticsFromSupabase(sb: SupabaseAdmin): Promise<AnalyticsSummary> {
    const countRows = async (table: string, column?: string, value?: string): Promise<number> => {
      let query = sb.from(table).select('id', { count: 'exact', head: true });
      if (column) query = query.eq(column, value);
      const { count, error } = await query;
      if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
      return count ?? 0;
    };

    const [totalProducts, publishedProducts, pendingDrafts, totalTelegramImports, pendingReviewImports] = await Promise.all([
      countRows('products'),
      countRows('products', 'status', 'published'),
      countRows('products', 'status', 'draft'),
      countRows('telegram_imports'),
      countRows('telegram_imports', 'review_status', 'pending'),
    ]);

    // Page through every recorded click (PostgREST caps rows per request).
    const clicks: ClickForStats[] = [];
    for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
      const { data, error } = await sb
        .from('affiliate_clicks')
        .select('product_id, retailer, referrer, campaign, timestamp')
        .order('timestamp', { ascending: true })
        .range(from, from + SUPABASE_PAGE_SIZE - 1);
      if (error) throw new Error(`Failed to load affiliate clicks: ${error.message}`);
      clicks.push(...((data ?? []) as ClickForStats[]));
      if (!data || data.length < SUPABASE_PAGE_SIZE) break;
    }

    const titles = new Map<string, string>();
    const productIds = Array.from(new Set(clicks.map(c => c.product_id)));
    for (let i = 0; i < productIds.length; i += 200) {
      const { data, error } = await sb.from('products').select('id, title').in('id', productIds.slice(i, i + 200));
      if (error) throw new Error(`Failed to load product titles: ${error.message}`);
      for (const p of data ?? []) titles.set(p.id, p.title);
    }

    return {
      totalProducts,
      publishedProducts,
      pendingDrafts,
      totalTelegramImports,
      pendingReviewImports,
      ...aggregateClicks(clicks, titles),
    };
  }

  async getAnalytics(): Promise<AnalyticsSummary> {
    const sb = this.supabase();
    // Errors propagate: showing zeros when the database is unreachable would misreport real traffic.
    if (sb) return this.getAnalyticsFromSupabase(sb);

    const titles = new Map(this.products.map(p => [p.id, p.title] as [string, string]));
    return {
      totalProducts: this.products.length,
      publishedProducts: this.products.filter(p => p.status === 'published').length,
      pendingDrafts: this.products.filter(p => p.status === 'draft').length,
      totalTelegramImports: this.telegramImports.length,
      pendingReviewImports: this.telegramImports.filter(i => i.review_status === 'pending').length,
      ...aggregateClicks(this.affiliateClicks, titles),
    };
  }

  // --- SETTINGS ---
  async getSettings(): Promise<WebsiteSettings> {
    const sb = this.supabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('website_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw new Error(error.message);
        // No row yet: the schema's column defaults are the same as initialSettings.
        return data ? mapSettingsRow(data) : this.settings;
      } catch (e) {
        // Settings are read by the root layout; never take the whole site down over them.
        console.error('Supabase settings read error, using defaults:', e);
        return this.settings;
      }
    }
    return this.settings;
  }

  async updateSettings(newSettings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const sb = this.supabase();
    if (sb) {
      const row = { ...toSettingsRow(newSettings), updated_at: new Date().toISOString() };
      const { data: existing, error: readError } = await sb
        .from('website_settings')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (readError) throw new Error(`Failed to read settings: ${readError.message}`);

      const { data, error } = existing
        ? await sb.from('website_settings').update(row).eq('id', existing.id).select('*').single()
        : await sb.from('website_settings').insert(row).select('*').single();
      if (error || !data) throw new Error(`Failed to save settings: ${error?.message ?? 'no row returned'}`);
      return mapSettingsRow(data);
    }

    this.settings = {
      ...this.settings,
      ...newSettings,
      updated_at: new Date().toISOString(),
    };
    return this.settings;
  }
}

export const db = new DataRepository();
