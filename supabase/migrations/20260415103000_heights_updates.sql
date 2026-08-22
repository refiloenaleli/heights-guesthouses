-- Add long_description and bed_info to room_prices
ALTER TABLE public.room_prices ADD COLUMN IF NOT EXISTS long_description TEXT DEFAULT '';
ALTER TABLE public.room_prices ADD COLUMN IF NOT EXISTS bed_info TEXT DEFAULT '';

-- Room images table for multiple images per room
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

CREATE POLICY "Anyone can view room images" ON public.room_images FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage room images" ON public.room_images FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Dining banners table for slideshow
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

CREATE POLICY "Anyone can view dining banners" ON public.dining_banners FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage dining banners" ON public.dining_banners FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_dining_banners_updated_at BEFORE UPDATE ON public.dining_banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Menu images table for downloadable menu
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

CREATE POLICY "Anyone can view menu images" ON public.menu_images FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage menu images" ON public.menu_images FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_menu_images_updated_at BEFORE UPDATE ON public.menu_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update room prices with new rates and add Executive room
UPDATE public.room_prices SET 
  price = 'M650.00',
  price_note = 'per night, all inclusive of breakfast',
  description = 'A cozy and modern retreat designed for the solo traveller who values comfort, privacy, and convenience.',
  long_description = 'Our Single Room offers a peaceful sanctuary for solo travellers. The room features a comfortable single bed with premium linens, a dedicated workspace, and an en-suite bathroom with modern fixtures. Enjoy complimentary high-speed WiFi, a flat-screen TV with satellite channels, and tea/coffee making facilities. The room is thoughtfully designed with warm neutral tones and elegant furnishings to ensure a restful stay.',
  bed_info = '1 Single Bed (3ft x 6ft 3in)',
  features = ARRAY['1 Single Bed', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included', 'Flat-Screen TV', 'Tea/Coffee Facilities']
WHERE room_type = 'Single Room';

UPDATE public.room_prices SET 
  price = 'M750.00',
  price_note = 'per night, all inclusive of breakfast',
  description = 'A romantic retreat with elegant furnishings and premium amenities designed for couples.',
  long_description = 'The Couple Room is our signature romantic getaway, featuring a luxurious king-sized bed draped in premium Egyptian cotton linens. The room boasts elegant furnishings, a seating area for two, and an en-suite bathroom with a rainfall shower. Start your day with complimentary breakfast served in our dining area, and enjoy amenities including high-speed WiFi, a flat-screen TV, mini-fridge, and tea/coffee making facilities. Large windows offer beautiful views of our manicured gardens.',
  bed_info = '1 King Bed (6ft x 6ft 6in)',
  features = ARRAY['1 King Bed', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included', 'Flat-Screen TV', 'Mini-Fridge', 'Garden View']
WHERE room_type = 'Couple Room';

UPDATE public.room_prices SET 
  price = 'M800.00',
  price_note = 'per night, all inclusive of breakfast',
  description = 'Spacious accommodation ideal for friends or colleagues travelling together with separate sleeping arrangements.',
  long_description = 'Our Sharing Room provides the perfect solution for friends or colleagues travelling together. The room features two comfortable single beds with individual reading lights and bedside tables. Each guest has their own wardrobe space and storage. The en-suite bathroom is spacious with a shower and vanity area. Both guests enjoy complimentary breakfast, high-speed WiFi, flat-screen TV, and tea/coffee making facilities. The room offers ample space for two without compromising on comfort or privacy.',
  bed_info = '2 Single Beds (3ft x 6ft 3in)',
  features = ARRAY['2 Single Beds', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included', 'Flat-Screen TV', 'Individual Reading Lights']
WHERE room_type = 'Sharing Room';

-- Add Executive room for both houses
INSERT INTO public.room_prices (guest_house, room_type, price, price_note, description, long_description, bed_info, features, display_order) VALUES
  ('greater-heights', 'Executive Room', 'M850.00', 'per night, all inclusive of breakfast', 'Our premium executive accommodation with superior amenities and spacious living area for the discerning traveller.',
   'The Executive Room represents the pinnacle of comfort and luxury at Greater Heights. This spacious suite features a super king-sized bed with the finest linens, a separate sitting area with a sofa, and a work desk. The en-suite bathroom includes both a rainfall shower and a deep soaking bathtub. Premium amenities include a Nespresso machine, smart TV, mini-bar, bathrobes, and slippers. Enjoy exclusive access to our executive lounge with complimentary evening drinks and canapés. This room is designed for guests who demand the very best.',
   '1 Super King Bed (6ft 6in x 6ft 6in)',
   ARRAY['1 Super King Bed', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included', 'Smart TV', 'Nespresso Machine', 'Mini-Bar', 'Bathrobes & Slippers', 'Separate Sitting Area', 'Executive Lounge Access'],
   3),
  ('new-heights', 'Executive Room', 'M850.00', 'per night, all inclusive of breakfast', 'Our premium executive accommodation with superior amenities and spacious living area for the discerning traveller.',
   'The Executive Room represents the pinnacle of comfort and luxury at New Heights. This spacious suite features a super king-sized bed with the finest linens, a separate sitting area with a sofa, and a work desk. The en-suite bathroom includes both a rainfall shower and a deep soaking bathtub. Premium amenities include a Nespresso machine, smart TV, mini-bar, bathrobes, and slippers. Enjoy exclusive access to our executive lounge with complimentary evening drinks and canapés. This room is designed for guests who demand the very best.',
   '1 Super King Bed (6ft 6in x 6ft 6in)',
   ARRAY['1 Super King Bed', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included', 'Smart TV', 'Nespresso Machine', 'Mini-Bar', 'Bathrobes & Slippers', 'Separate Sitting Area', 'Executive Lounge Access'],
   3)
ON CONFLICT DO NOTHING;

-- Update contact settings with new details
UPDATE public.contact_settings SET 
  phone = '+266 58943042',
  whatsapp = '+266 58943042',
  email = 'greaterheightsbnb@gmail.com',
  address = 'Maseru, Lesotho'
WHERE guest_house = 'greater-heights';

UPDATE public.contact_settings SET 
  phone = '+266 58943042',
  whatsapp = '+266 58943042',
  email = 'greaterheightsbnb@gmail.com',
  address = 'Maseru, Lesotho'
WHERE guest_house = 'new-heights';

-- Seed default dining banners for both houses
INSERT INTO public.dining_banners (guest_house, image_url, title, description, banner_type, display_order) VALUES
  ('greater-heights', '', 'Elegant Dining Setup', 'Experience fine dining in our beautifully appointed restaurant', 'setup', 0),
  ('greater-heights', '', 'Exquisite Cuisine', 'Fuel your morning, satisfy your afternoon, and indulge your evening', 'food', 1),
  ('new-heights', '', 'Elegant Dining Setup', 'Experience fine dining in our beautifully appointed restaurant', 'setup', 0),
  ('new-heights', '', 'Exquisite Cuisine', 'Fuel your morning, satisfy your afternoon, and indulge your evening', 'food', 1)
ON CONFLICT DO NOTHING;

-- Create storage bucket for dining banners
INSERT INTO storage.buckets (id, name, public) VALUES ('dining', 'dining', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('menus', 'menus', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('room_images', 'room_images', true)
ON CONFLICT DO NOTHING;

-- Storage policies for dining bucket
CREATE POLICY IF NOT EXISTS "Anyone can view dining files" ON storage.objects
  FOR SELECT USING (bucket_id = 'dining');

CREATE POLICY IF NOT EXISTS "Admins can upload dining files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dining' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can delete dining files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'dining' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for menus bucket
CREATE POLICY IF NOT EXISTS "Anyone can view menu files" ON storage.objects
  FOR SELECT USING (bucket_id = 'menus');

CREATE POLICY IF NOT EXISTS "Admins can upload menu files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menus' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can delete menu files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'menus' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for room_images bucket
CREATE POLICY IF NOT EXISTS "Anyone can view room_images files" ON storage.objects
  FOR SELECT USING (bucket_id = 'room_images');

CREATE POLICY IF NOT EXISTS "Admins can upload room_images files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'room_images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can delete room_images files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'room_images' AND public.has_role(auth.uid(), 'admin'::app_role));