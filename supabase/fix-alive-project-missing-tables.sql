-- ============================================================================
-- Heights Guest Houses — restore missing tables on the live Supabase project
-- (asfkepmbqvciieblkvoi)
--
-- WHY: The admin dashboard could not add/change images because the app was
-- pointed at a DELETED Supabase project. After switching the app back to this
-- (alive) project, 4 tables used by the admin were still missing here:
--     room_images, dining_banners, menu_images, contact_inquiries
--
-- HOW TO RUN: open the Supabase Dashboard for this project -> SQL Editor ->
-- paste this whole file -> Run. It is idempotent (safe to run more than once).
-- ============================================================================

-- The updated_at trigger helper must exist before the triggers below.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================================
-- 1) room_images  (Room Images admin panel + room detail modals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.room_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_house TEXT NOT NULL CHECK (guest_house IN ('greater-heights', 'new-heights')),
  room_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='room_images' AND policyname='Anyone can view room images') THEN
    CREATE POLICY "Anyone can view room images" ON public.room_images FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='room_images' AND policyname='Admins can manage room images') THEN
    CREATE POLICY "Admins can manage room images" ON public.room_images FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- ============================================================================
-- 2) dining_banners  (Dining Banners admin panel + dining slideshow)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dining_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_house TEXT NOT NULL CHECK (guest_house IN ('greater-heights', 'new-heights')),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  banner_type TEXT NOT NULL DEFAULT 'setup' CHECK (banner_type IN ('setup', 'food')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dining_banners ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dining_banners' AND policyname='Anyone can view dining banners') THEN
    CREATE POLICY "Anyone can view dining banners" ON public.dining_banners FOR SELECT TO public USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dining_banners' AND policyname='Admins can manage dining banners') THEN
    CREATE POLICY "Admins can manage dining banners" ON public.dining_banners FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_dining_banners_updated_at ON public.dining_banners;
CREATE TRIGGER update_dining_banners_updated_at BEFORE UPDATE ON public.dining_banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- 3) menu_images  (Menu Images admin panel + downloadable menus)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.menu_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_house TEXT NOT NULL CHECK (guest_house IN ('greater-heights', 'new-heights')),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Menu',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_images ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='menu_images' AND policyname='Anyone can view menu images') THEN
    CREATE POLICY "Anyone can view menu images" ON public.menu_images FOR SELECT TO public USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='menu_images' AND policyname='Admins can manage menu images') THEN
    CREATE POLICY "Admins can manage menu images" ON public.menu_images FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_menu_images_updated_at ON public.menu_images;
CREATE TRIGGER update_menu_images_updated_at BEFORE UPDATE ON public.menu_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 4) contact_inquiries  (Contact form submissions + Contacts admin panel)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_house TEXT NOT NULL CHECK (guest_house IN ('greater-heights', 'new-heights')),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_inquiries' AND policyname='Anyone can submit contact inquiries') THEN
    CREATE POLICY "Anyone can submit contact inquiries" ON public.contact_inquiries FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_inquiries' AND policyname='Admins can manage contact inquiries') THEN
    CREATE POLICY "Admins can manage contact inquiries" ON public.contact_inquiries FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- ============================================================================
-- 5) Storage buckets + policies (idempotent; the buckets already exist here,
--    but this guarantees the admin can upload/delete into them)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('dining', 'dining', true),
  ('menus', 'menus', true),
  ('room_images', 'room_images', true),
  ('site_images', 'site_images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for each bucket
DO $$
DECLARE p TEXT;
BEGIN
  FOREACH p IN ARRAY ARRAY['dining', 'menus', 'room_images', 'site_images']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'Anyone can view ' || p || ' files'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L);',
        'Anyone can view ' || p || ' files', p
      );
    END IF;
  END LOOP;
END $$;

-- Admin upload for each bucket
DO $$
DECLARE p TEXT;
BEGIN
  FOREACH p IN ARRAY ARRAY['dining', 'menus', 'room_images', 'site_images']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'Admins can upload ' || p || ' files'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L AND public.has_role(auth.uid(), ''admin''::app_role));',
        'Admins can upload ' || p || ' files', p
      );
    END IF;
  END LOOP;
END $$;

-- Admin update/delete for each bucket
DO $$
DECLARE p TEXT;
BEGIN
  FOREACH p IN ARRAY ARRAY['dining', 'menus', 'room_images', 'site_images']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'Admins can manage ' || p || ' files'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L AND public.has_role(auth.uid(), ''admin''::app_role));',
        'Admins can manage ' || p || ' files', p
      );
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'Admins can delete ' || p || ' files'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %L AND public.has_role(auth.uid(), ''admin''::app_role));',
        'Admins can delete ' || p || ' files', p
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 6) OPTIONAL — grant the ADMIN role to an existing auth user.
--    Replace YOUR_ADMIN_EMAIL below with the email of the account you use to
--    log into the dashboard, then run ONLY this block.
-- ============================================================================
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL'
-- ON CONFLICT (user_id, role) DO NOTHING;
