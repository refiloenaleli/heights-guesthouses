-- ============================================================================
-- Heights Guest Houses — security hardening (idempotent; safe to re-run)
-- ============================================================================
-- 1) Defense-in-depth: remove ALL direct table privileges on the roles table.
--    Role checks must go through the SECURITY DEFINER function public.has_role(...),
--    which is the only path the app uses. This removes any accidental read/write
--    surface on user_roles, even via RLS policy misconfigurations on some environment.

REVOKE ALL ON TABLE public.user_roles FROM anon, authenticated;

-- 2) Guarantee RLS is enabled on every application table (idempotent),
--    so no table can silently expose its rows if a migration was missed on a live project.

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bookings', 'reviews', 'gallery_images', 'contact_settings',
    'promotions', 'menu_items', 'room_prices', 'room_images',
    'dining_banners', 'menu_images', 'site_images', 'contact_inquiries', 'user_roles'
  ]
  LOOP
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- 3) Re-assert the public-read policy for site_images (idempotent):
--    visitors must be able to see admin image overrides, but never write them.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_images'
      AND policyname = 'Anyone can view site images'
  ) THEN
    CREATE POLICY "Anyone can view site images" ON public.site_images
      FOR SELECT TO public USING (true);
  END IF;
END $$;

-- 4) Storage bucket hardening: ensure every upload/delete policy on the app's
--    public buckets is restricted to logged-in ADMINS (anons must not be able
--    to write files, even accidentally).

DO $$
DECLARE p TEXT;
BEGIN
  FOREACH p IN ARRAY ARRAY['gallery', 'dining', 'menus', 'room_images', 'site_images']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'Admins can upload ' || p || ' files'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated
         WITH CHECK (bucket_id = %L AND public.has_role(auth.uid(), ''admin''::app_role));',
        'Admins can upload ' || p || ' files', p
      );
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'Admins can delete ' || p || ' files'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated
         USING (bucket_id = %L AND public.has_role(auth.uid(), ''admin''::app_role));',
        'Admins can delete ' || p || ' files', p
      );
    END IF;
  END LOOP;
END $$;