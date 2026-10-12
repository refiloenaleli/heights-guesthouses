-- ============================================================================
-- Heights Guest Houses — add columns the app needs but that are missing on
-- the live Supabase project (asfkepmbqvciieblkvoi)
--
-- Fixes:
--   1) menu_images.caption   -> menu image uploads were failing ("cannot add
--      new menu images") because the code saves a caption but the column was
--      never created on this project.
--   2) room_prices.long_description + bed_info -> used by the prices panel and
--      the accommodation page.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query -> paste all ->
-- Run. It is idempotent (safe to run more than once).
-- ============================================================================

-- 1) Menu images caption column
ALTER TABLE public.menu_images
  ADD COLUMN IF NOT EXISTS caption TEXT;

-- 2) Room prices extra columns
ALTER TABLE public.room_prices
  ADD COLUMN IF NOT EXISTS long_description TEXT DEFAULT '';
ALTER TABLE public.room_prices
  ADD COLUMN IF NOT EXISTS bed_info TEXT DEFAULT '';

-- Sanity check: list the columns of the two fixed tables so you can confirm
-- caption / long_description / bed_info now exist.
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('menu_images', 'room_prices')
ORDER BY table_name, ordinal_position;
