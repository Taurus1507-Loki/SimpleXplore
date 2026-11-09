-- ==============================================================================
-- SimpleXplore Database Schema
-- Version: 1.0.0
-- Designed for Supabase PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    retailer TEXT NOT NULL,
    current_price NUMERIC(12, 2) NOT NULL CHECK (current_price >= 0),
    original_price NUMERIC(12, 2) CHECK (original_price >= current_price OR original_price IS NULL),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    discount NUMERIC(5, 2) DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INT DEFAULT 0 CHECK (review_count >= 0),
    image_url TEXT NOT NULL,
    affiliate_url TEXT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    trending BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'bulk_upload', 'telegram')),
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

-- 6. AFFILIATE CLICKS TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    referrer TEXT,
    campaign TEXT,
    session_id TEXT,
    retailer TEXT,
    user_agent TEXT
);

-- 7. TELEGRAM CHANNELS TABLE
CREATE TABLE IF NOT EXISTS public.telegram_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id TEXT NOT NULL UNIQUE,
    channel_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TELEGRAM UPDATES TABLE (Idempotency & Audit)
CREATE TABLE IF NOT EXISTS public.telegram_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id BIGINT NOT NULL UNIQUE,
    channel_id TEXT NOT NULL,
    message_id BIGINT NOT NULL,
    message_text TEXT,
    original_urls JSONB DEFAULT '[]'::jsonb,
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'ignored')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TELEGRAM IMPORTS TABLE
CREATE TABLE IF NOT EXISTS public.telegram_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_update_id UUID REFERENCES public.telegram_updates(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    original_url TEXT NOT NULL,
    affiliate_url TEXT NOT NULL,
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    extraction_status TEXT NOT NULL DEFAULT 'partial' CHECK (extraction_status IN ('success', 'partial', 'failed')),
    error_message TEXT,
    review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. IMPORT JOBS TABLE (CSV / Excel)
CREATE TABLE IF NOT EXISTS public.import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    total_rows INT NOT NULL DEFAULT 0,
    successful_rows INT NOT NULL DEFAULT 0,
    failed_rows INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. IMPORT ERRORS TABLE
CREATE TABLE IF NOT EXISTS public.import_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_job_id UUID NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    error_message TEXT NOT NULL
);

-- 12. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. WEBSITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT NOT NULL DEFAULT 'SimpleXplore',
    tagline TEXT NOT NULL DEFAULT 'Shop Smart • Explore More',
    primary_color TEXT NOT NULL DEFAULT '#168A45',
    default_currency TEXT NOT NULL DEFAULT 'INR',
    contact_email TEXT NOT NULL DEFAULT 'support@simplexplore.com',
    social_links JSONB DEFAULT '{"twitter":"https://twitter.com/simplexplore","telegram":"https://t.me/simplexplore","instagram":"https://instagram.com/simplexplore"}'::jsonb,
    affiliate_disclosure TEXT NOT NULL DEFAULT 'SimpleXplore is a reader-supported shopping discovery platform. When you buy through affiliate links on our site, we may earn an affiliate commission at no extra cost to you.',
    homepage_config JSONB DEFAULT '{"show_hero": true, "show_trending": true, "show_deals": true, "show_categories": true}'::jsonb,
    telegram_config JSONB DEFAULT '{"auto_import": true, "default_channel": ""}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_retailer ON public.products(retailer);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_trending ON public.products(trending) WHERE trending = true;
CREATE INDEX IF NOT EXISTS idx_telegram_imports_review ON public.telegram_imports(review_status);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON public.affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES POLICIES
CREATE POLICY "Categories viewable by everyone" ON public.categories
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin can modify categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- PRODUCTS POLICIES: Visitors only see published; Admins see all
CREATE POLICY "Public can view published products" ON public.products
    FOR SELECT USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admin can modify products" ON public.products
    FOR ALL USING (public.is_admin());

-- PRODUCT IMAGES POLICIES
CREATE POLICY "Public can view product images" ON public.product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id AND (p.status = 'published' OR public.is_admin())
        )
    );

CREATE POLICY "Admin can modify product images" ON public.product_images
    FOR ALL USING (public.is_admin());

-- WISHLISTS POLICIES (Strictly per-user private)
CREATE POLICY "Users can manage their own wishlist" ON public.wishlists
    FOR ALL USING (auth.uid() = user_id);

-- AFFILIATE CLICKS POLICIES
CREATE POLICY "Public can insert affiliate clicks" ON public.affiliate_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view affiliate clicks" ON public.affiliate_clicks
    FOR SELECT USING (public.is_admin());

-- TELEGRAM & ADMIN MANAGEMENT TABLES
CREATE POLICY "Admins manage telegram channels" ON public.telegram_channels
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage telegram updates" ON public.telegram_updates
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage telegram imports" ON public.telegram_imports
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage import jobs" ON public.import_jobs
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage import errors" ON public.import_errors
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage audit logs" ON public.admin_audit_logs
    FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view website settings" ON public.website_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can update website settings" ON public.website_settings
    FOR ALL USING (public.is_admin());

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT := 'customer';
BEGIN
  -- If user email matches primary administrator email, assign admin role
  IF LOWER(NEW.email) = 'simplore01@gmail.com' OR NEW.email = 'admin@simplexplore.com' THEN
    default_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), default_role)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED DATA: CATEGORIES
-- ==============================================================================
INSERT INTO public.categories (name, slug, description, image, sort_order)
VALUES
('Fashion', 'fashion', 'Trendy clothing, apparel and styles for everyone', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80', 1),
('Women''s Fashion', 'womens-fashion', 'Ethnic wear, western dresses, tops and footwear', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80', 2),
('Men''s Fashion', 'mens-fashion', 'Shirts, formal wear, casuals and sneakers', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&auto=format&fit=crop&q=80', 3),
('Footwear', 'footwear', 'Comfortable sneakers, casual shoes, heels and sandals', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', 4),
('Beauty & Personal Care', 'beauty-personal-care', 'Skincare, haircare, makeup and fragrance', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80', 5),
('Electronics', 'electronics', 'Audio, smart devices, laptops and mobile accessories', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 6),
('Home & Kitchen', 'home-kitchen', 'Cookware, modern appliances, decor and organizers', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80', 7),
('Accessories', 'accessories', 'Watches, premium sunglasses, bags and wallets', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', 8),
('Lifestyle', 'lifestyle', 'Fitness gear, travel essentials and smart living', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80', 9)
ON CONFLICT (slug) DO NOTHING;

-- SEED DEFAULT SETTINGS
INSERT INTO public.website_settings (site_name, tagline, primary_color, default_currency, contact_email)
SELECT 'SimpleXplore', 'Shop Smart • Explore More', '#168A45', 'INR', 'support@simplexplore.com'
WHERE NOT EXISTS (SELECT 1 FROM public.website_settings);

