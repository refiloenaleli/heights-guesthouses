-- Contact inquiries saved from the public contact form.
-- Idempotent: safe to run on databases where the table already exists.

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
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_inquiries'
      AND policyname = 'Anyone can submit contact inquiries'
  ) THEN
    CREATE POLICY "Anyone can submit contact inquiries" ON public.contact_inquiries
      FOR INSERT TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_inquiries'
      AND policyname = 'Admins can manage contact inquiries'
  ) THEN
    CREATE POLICY "Admins can manage contact inquiries" ON public.contact_inquiries
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
