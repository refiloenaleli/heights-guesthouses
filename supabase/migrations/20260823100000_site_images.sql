-- ============================================================
-- Site Images: admin-managed images for every image slot on
-- the public website (heroes, logos, landing cards, welcome
-- galleries, dining photos, etc.)
--
-- A row overrides the built-in default for its slot_key.
-- Singleton slots store one row (display_order = 0);
-- gallery-style slots ("add more" slots) may store many rows,
-- ordered by display_order.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- One image per (slot, order); keeps singleton slots unique at order 0
CREATE UNIQUE INDEX IF NOT EXISTS site_images_slot_order_idx
  ON public.site_images (slot_key, display_order);

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Public website must be able to read overrides
CREATE POLICY "Anyone can view site images"
  ON public.site_images FOR SELECT
  TO public
  USING (true);

-- Only admins may manage them
CREATE POLICY "Admins can manage site images"
  ON public.site_images FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS update_site_images_updated_at ON public.site_images;
CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for uploaded site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site_images', 'site_images', true)
ON CONFLICT DO NOTHING;

-- Storage policies (Postgres does not support CREATE POLICY IF NOT EXISTS,
-- so guard each statement in a DO block for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Anyone can view site_images files'
  ) THEN
    CREATE POLICY "Anyone can view site_images files" ON storage.objects
      FOR SELECT USING (bucket_id = 'site_images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can upload site_images files'
  ) THEN
    CREATE POLICY "Admins can upload site_images files" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'site_images' AND public.has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can update site_images files'
  ) THEN
    CREATE POLICY "Admins can update site_images files" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'site_images' AND public.has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can delete site_images files'
  ) THEN
    CREATE POLICY "Admins can delete site_images files" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'site_images' AND public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
