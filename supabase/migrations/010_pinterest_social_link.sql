-- ==============================================================================
-- 010: Set default Pinterest social link in website_settings
-- ==============================================================================
UPDATE public.website_settings
SET social_links = jsonb_set(
  COALESCE(social_links, '{}'::jsonb),
  '{pinterest}',
  '"https://in.pinterest.com/SimpleXplore/"'::jsonb,
  true
)
WHERE COALESCE(social_links->>'pinterest', '') = '';
