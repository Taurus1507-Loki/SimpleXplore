import { 
  Product, 
  Category, 
  TelegramImport, 
  AffiliateClick, 
  WebsiteSettings, 
  ProductStatus 
} from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';

// Check if live Supabase credentials are configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('placeholder') || url.includes('example.supabase.co')) return false;
  if (key.includes('dummy')) return false;
  return true;
}

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
  {
    id: 'prod-nike-air-max-90',
    title: 'Nike Air Max 90 Classic Running and Lifestyle Shoes',
    slug: 'nike-air-max-90-classic-running-shoes',
    description: 'Nothing as fly, nothing as comfortable, nothing as proven. The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU accents.',
    highlights: [
      'Max Air cushioning originally designed for performance running',
      'Padded low-top collar looks sleek and feels comfortable',
      'Rubber Waffle outsole delivers traction and durability',
    ],
    category_id: 'cat-footwear',
    retailer: 'Myntra',
    current_price: 7495,
    original_price: 9995,
    currency: 'INR',
    discount: 25,
    rating: 4.5,
    review_count: 3120,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    affiliate_url: 'https://www.myntra.com/shoes/nike/nike-men-air-max-90/p/231241?utm_source=simplexplore',
    featured: false,
    trending: true,
    status: 'published',
    source_type: 'manual',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'prod-minimalist-serum',
    title: 'Minimalist 10% Niacinamide Face Serum with Zinc for Blemishes & Oil Control',
    slug: 'minimalist-10-niacinamide-face-serum-with-zinc',
    description: 'A pure 10% Niacinamide serum that balances oil production, reduces acne marks, blemishes, and strengthens skin barrier. Enriched with Aloe Vera juice for soothing hydration.',
    highlights: [
      'Clinically proven to reduce dark spots and sebum within 4 weeks',
      'Formulated with high purity European Niacinamide (Vitamin B3)',
      'Fragrance-free, non-comedogenic and hypoallergenic',
    ],
    category_id: 'cat-beauty',
    retailer: 'Nykaa',
    current_price: 569,
    original_price: 599,
    currency: 'INR',
    discount: 5,
    rating: 4.8,
    review_count: 19840,
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    affiliate_url: 'https://www.nykaa.com/minimalist-10-niacinamide-face-serum/p/1063920?utm_source=simplexplore',
    featured: true,
    trending: false,
    status: 'published',
    source_type: 'manual',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'prod-fossil-chronograph',
    title: 'Fossil Grant Chronograph Black Leather Dial Men Watch (FS4812)',
    slug: 'fossil-grant-chronograph-black-leather-watch',
    description: 'Modeled after vintage clocks, Roman numerals and a handsome textured leather strap give this classic watch an artistic balance and masculine sophistication.',
    highlights: [
      '44mm stainless steel case with mineral dial window',
      'Genuine black leather strap with buckle closure',
      'Water resistant to 50m (165ft): suitable for short periods of swimming',
    ],
    category_id: 'cat-accessories',
    retailer: 'Tata CLiQ Luxury',
    current_price: 7995,
    original_price: 13995,
    currency: 'INR',
    discount: 43,
    rating: 4.4,
    review_count: 2410,
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    affiliate_url: 'https://luxury.tatacliq.com/fossil-grant-chronograph-watch/p-mp00000000012?aff=simplexplore',
    featured: false,
    trending: true,
    status: 'published',
    source_type: 'manual',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'prod-philips-air-fryer',
    title: 'Philips Digital Air Fryer HD9252/90 with Rapid Air Technology (4.1 Litre)',
    slug: 'philips-digital-air-fryer-rapid-air-hd9252',
    description: 'Fry with up to 90% less fat. Touch screen with 7 presets for frozen snacks, fresh fries, meat, fish, chicken drumsticks, cake and even grilled veggies. Keep warm function ensures delicious warm food anytime.',
    highlights: [
      'Patented Rapid Air Technology with unique starfish design',
      'Digital touch screen with 7 preset cooking programs',
      'Dishwasher safe removable non-stick basket',
    ],
    category_id: 'cat-home-kitchen',
    retailer: 'Amazon India',
    current_price: 8999,
    original_price: 12995,
    currency: 'INR',
    discount: 31,
    rating: 4.5,
    review_count: 11200,
    image_url: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&auto=format&fit=crop&q=80',
    affiliate_url: 'https://www.amazon.in/dp/B08HRZBC3T?tag=simplexplore-21',
    featured: true,
    trending: false,
    status: 'published',
    source_type: 'manual',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'prod-womens-anarkali-kurti',
    title: 'BIBA Women Floral Print Pure Cotton Anarkali Kurta with Dupatta Set',
    slug: 'biba-women-floral-print-cotton-anarkali-kurta-set',
    description: 'Elevate your festive look with this elegant pure cotton floral printed Anarkali kurta set. Tailored in an exquisite silhouette with delicate lace borders and matching chiffon dupatta.',
    highlights: [
      '100% breathable premium cotton fabric',
      'Flared Anarkali hemline with mandarin neck and 3/4 sleeves',
      'Includes matching floral printed dupatta and straight trousers',
    ],
    category_id: 'cat-womens-fashion',
    retailer: 'Myntra',
    current_price: 2499,
    original_price: 4999,
    currency: 'INR',
    discount: 50,
    rating: 4.3,
    review_count: 1840,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    affiliate_url: 'https://www.myntra.com/kurta-sets/biba/biba-women-floral-anarkali/p/892341?utm_source=simplexplore',
    featured: false,
    trending: true,
    status: 'published',
    source_type: 'manual',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'prod-mens-linen-shirt',
    title: 'Marks & Spencer Pure Linen Casual Slim Fit Long Sleeve Shirt',
    slug: 'marks-spencer-pure-linen-casual-slim-fit-shirt',
    description: 'Keep your smart-casual wardrobe breezy with this pure linen shirt. Cut to a modern slim fit with a classic button-down collar and single cuffs.',
    highlights: [
      'Made from 100% European Flax certified pure linen',
      'Naturally breathable and temperature-regulating for Indian summers',
      'Easy-iron finish for effortless daily maintenance',
    ],
    category_id: 'cat-mens-fashion',
    retailer: 'Tata CLiQ',
    current_price: 2199,
    original_price: 3499,
    currency: 'INR',
    discount: 37,
    rating: 4.4,
    review_count: 980,
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    affiliate_url: 'https://www.tatacliq.com/marks-spencer-mens-linen-shirt/p-mp0000000004921?aff=simplexplore',
    featured: false,
    trending: false,
    status: 'published',
    source_type: 'manual',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
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

// In-Memory store for demo mode & dynamic state
class DataRepository {
  private categories: Category[] = [...initialCategories];
  private products: Product[] = [...initialProducts];
  private telegramImports: TelegramImport[] = [...initialTelegramImports];
  private affiliateClicks: AffiliateClick[] = [];
  private settings: WebsiteSettings = { ...initialSettings };
  private wishlists: Record<string, string[]> = {}; // userId -> productIds[]

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
          current_price: imp.extracted_data.price || 999,
          original_price: imp.extracted_data.original_price || null,
          currency: 'INR',
          discount: imp.extracted_data.discount || 0,
          rating: imp.extracted_data.rating || 4.2,
          review_count: imp.extracted_data.review_count || 100,
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

  async getProductById(id: string): Promise<Product | null> {
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
      rating: data.rating || 0,
      review_count: data.review_count || 0,
      image_url: data.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      affiliate_url: data.affiliate_url || '#',
      featured: data.featured || false,
      trending: data.trending || false,
      status: data.status || 'draft',
      source_type: data.source_type || 'manual',
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.products.unshift(newProduct);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('products').insert(newProduct);
      } catch (e) {
        console.error('Supabase product insert error:', e);
      }
    }

    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.products[index] = {
      ...this.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('products').update(updates).eq('id', id);
      } catch (e) {
        console.error('Supabase product update error:', e);
      }
    }

    return this.products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase product delete error:', e);
      }
    }
    return true;
  }

  // --- TELEGRAM IMPORTS ---
  async getTelegramImports(filter?: { review_status?: string; extraction_status?: string }): Promise<TelegramImport[]> {
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
    const item = this.telegramImports.find(i => i.id === id);
    if (!item) return null;
    return {
      ...item,
      product: this.products.find(p => p.id === item.product_id) || undefined,
    };
  }

  async createTelegramImport(data: Partial<TelegramImport>): Promise<TelegramImport> {
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

  async approveAndPublishTelegramImport(importId: string, editedData?: Partial<Product>): Promise<{ success: boolean; product?: Product; error?: string }> {
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

    this.affiliateClicks.unshift(click);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('affiliate_clicks').insert(click);
      } catch (e) {
        console.error('Supabase click tracking error:', e);
      }
    }

    return click;
  }

  async getAnalytics() {
    const totalProducts = this.products.length;
    const publishedProducts = this.products.filter(p => p.status === 'published').length;
    const pendingDrafts = this.products.filter(p => p.status === 'draft').length;
    const totalTelegramImports = this.telegramImports.length;
    const pendingReviewImports = this.telegramImports.filter(i => i.review_status === 'pending').length;
    const totalClicks = this.affiliateClicks.length + 184; // Include baseline demo clicks

    // Retailer breakdown
    const clicksByRetailer: Record<string, number> = {
      'Amazon India': 92,
      'Flipkart': 54,
      'Myntra': 24,
      'Nykaa': 14,
    };

    for (const c of this.affiliateClicks) {
      if (c.retailer) {
        clicksByRetailer[c.retailer] = (clicksByRetailer[c.retailer] || 0) + 1;
      }
    }

    return {
      totalProducts,
      publishedProducts,
      pendingDrafts,
      totalTelegramImports,
      pendingReviewImports,
      totalClicks,
      clicksByRetailer,
    };
  }

  // --- SETTINGS ---
  async getSettings(): Promise<WebsiteSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    this.settings = {
      ...this.settings,
      ...newSettings,
      updated_at: new Date().toISOString(),
    };
    return this.settings;
  }
}

export const db = new DataRepository();

