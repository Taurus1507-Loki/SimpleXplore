-- ==============================================================================
-- 009: Add Home Decor category
-- ==============================================================================
INSERT INTO public.categories (name, slug, description, is_active, sort_order)
VALUES (
  'Home Decor',
  'home-decor',
  'Wall art, lamps, cushions, planters and home accents',
  true,
  8
)
ON CONFLICT (slug) DO NOTHING;
