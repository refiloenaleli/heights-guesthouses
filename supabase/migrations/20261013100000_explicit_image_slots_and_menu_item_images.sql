ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS image_url TEXT;

WITH legacy_images AS (
  SELECT
    id,
    slot_key,
    image_url,
    alt_text,
    row_number() OVER (PARTITION BY slot_key ORDER BY display_order, id) AS position
  FROM public.site_images
  WHERE slot_key IN (
    'greater-heights.dining.meals',
    'new-heights.dining.meals',
    'greater-heights.home.welcome'
  )
), explicit_images AS (
  SELECT
    CASE
      WHEN slot_key = 'greater-heights.home.welcome'
        THEN 'greater-heights.home.welcome.' || position::TEXT
      ELSE slot_key || '.' || position::TEXT
    END AS slot_key,
    image_url,
    alt_text,
    position - 1 AS display_order
  FROM legacy_images
)
INSERT INTO public.site_images (slot_key, image_url, alt_text, display_order)
SELECT slot_key, image_url, alt_text, display_order
FROM explicit_images
ON CONFLICT (slot_key, display_order) DO NOTHING;

DELETE FROM public.site_images
WHERE slot_key IN (
  'greater-heights.dining.meals',
  'new-heights.dining.meals',
  'greater-heights.home.welcome'
);
