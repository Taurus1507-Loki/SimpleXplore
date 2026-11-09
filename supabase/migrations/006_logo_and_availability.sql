-- ==============================================================================
-- 006: Site logo and product availability
-- ==============================================================================

-- Logo shown in the header/footer (uploaded via Admin → Website Settings).
ALTER TABLE public.website_settings
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Stock status as reported by the retailer. NULL = unknown (never guessed).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS availability TEXT
  CHECK (availability IS NULL OR availability IN ('in_stock', 'out_of_stock', 'limited'));
