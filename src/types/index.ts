export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image?: string | null;
  description?: string | null;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
}

/** Stock status reported by the retailer; null/undefined = unknown (never guessed). */
export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'limited';

export type ProductStatus = 'draft' | 'published' | 'archived';
export type ProductSourceType = 'manual' | 'bulk_upload' | 'telegram';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  highlights?: string[] | null;
  category_id?: string | null;
  category?: Category | null;
  retailer: string;
  current_price: number;
  original_price?: number | null;
  currency: string;
  discount?: number | null;
  rating?: number | null;
  review_count?: number | null;
  image_url: string;
  affiliate_url: string;
  featured: boolean;
  trending: boolean;
  status: ProductStatus;
  source_type: ProductSourceType;
  seo_title?: string | null;
  seo_description?: string | null;
  availability?: ProductAvailability | null;
  created_at: string;
  updated_at?: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface AffiliateClick {
  id: string;
  product_id: string;
  timestamp: string;
  referrer?: string | null;
  campaign?: string | null;
  session_id?: string | null;
  retailer?: string | null;
  user_agent?: string | null;
}

export interface TelegramChannel {
  id: string;
  channel_id: string;
  channel_name: string;
  is_active: boolean;
  created_at: string;
}

export interface TelegramUpdate {
  id: string;
  update_id: number;
  channel_id: string;
  message_id: number;
  message_text?: string | null;
  original_urls: string[];
  processing_status: 'pending' | 'processed' | 'failed' | 'ignored';
  created_at: string;
}

export type ExtractionStatus = 'success' | 'partial' | 'failed';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface TelegramImport {
  id: string;
  telegram_update_id?: string | null;
  product_id?: string | null;
  original_url: string;
  affiliate_url: string;
  extracted_data: {
    title?: string;
    description?: string;
    price?: number;
    original_price?: number;
    discount?: number;
    retailer?: string;
    image_url?: string;
    category?: string;
    rating?: number;
    review_count?: number;
    highlights?: string[];
    raw_message?: string;
    is_duplicate?: boolean;
    /** Fields extraction could not verify; left blank for the admin to complete. */
    missing_fields?: string[];
    /** Telegram channel the post came from, and when it was posted (ISO). */
    availability?: ProductAvailability;
    channel_name?: string;
    message_date?: string;
    /** Set when an edited Telegram post targets an already-published product. */
    pending_update?: boolean;
    duplicate_of_id?: string;
    duplicate_of_title?: string;
    duplicate_of_status?: string;
  };
  extraction_status: ExtractionStatus;
  error_message?: string | null;
  review_status: ReviewStatus;
  created_at: string;
  updated_at?: string;
  product?: Product;
  telegram_update?: TelegramUpdate;
}

export interface ImportJob {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  created_at: string;
}

export interface ImportJobError {
  id: string;
  import_job_id: string;
  row_number: number;
  error_message: string;
}

export interface WebsiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  /** Uploaded logo image; falls back to the built-in mark when empty. */
  logo_url?: string | null;
  primary_color: string;
  default_currency: string;
  contact_email: string;
  social_links: {
    twitter?: string;
    telegram?: string;
    instagram?: string;
    facebook?: string;
  };
  affiliate_disclosure: string;
  homepage_config: {
    show_hero: boolean;
    show_trending: boolean;
    show_deals: boolean;
    show_categories: boolean;
  };
  telegram_config: {
    auto_import: boolean;
    default_channel?: string;
  };
  updated_at: string;
}

