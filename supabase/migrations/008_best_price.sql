-- ==============================================================================
-- 008: Lowest-ever ("best") price
-- ==============================================================================
-- "Best Price" from the Telegram deal template / Google Sheet: the lowest price the
-- product has ever been seen at. It is NOT the MRP and never feeds the discount.
-- NULL = unknown.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS best_price NUMERIC(12, 2)
  CHECK (best_price IS NULL OR best_price > 0);
