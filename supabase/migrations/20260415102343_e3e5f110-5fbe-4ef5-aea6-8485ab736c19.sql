
-- Promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_house TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  discount_percentage INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active promotions" ON public.promotions FOR SELECT TO public USING (is_active = true);

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_house TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'breakfast',
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view available menu items" ON public.menu_items FOR SELECT TO public USING (is_available = true);

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Room prices table
CREATE TABLE public.room_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_house TEXT NOT NULL,
  room_type TEXT NOT NULL,
  price TEXT NOT NULL,
  price_note TEXT DEFAULT 'per night',
  description TEXT NOT NULL DEFAULT '',
  features TEXT[] NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.room_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage room prices" ON public.room_prices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view room prices" ON public.room_prices FOR SELECT TO public USING (true);

CREATE TRIGGER update_room_prices_updated_at BEFORE UPDATE ON public.room_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default menu items for both guest houses
INSERT INTO public.menu_items (guest_house, name, description, price, category, display_order) VALUES
  ('greater-heights', 'Full English Breakfast', 'Eggs, bacon, sausage, toast, grilled tomato', 'M85', 'breakfast', 0),
  ('greater-heights', 'Continental Breakfast', 'Croissants, fruit, yogurt, cereals, juice', 'M65', 'breakfast', 1),
  ('greater-heights', 'African Breakfast', 'Traditional porridge, bread, eggs, tea', 'M55', 'breakfast', 2),
  ('greater-heights', 'Grilled Chicken Salad', 'Mixed greens, grilled chicken, vinaigrette', 'M95', 'lunch', 0),
  ('greater-heights', 'Club Sandwich', 'Triple-decker with fries and coleslaw', 'M85', 'lunch', 1),
  ('greater-heights', 'Beef Stew', 'Slow-cooked beef with seasonal vegetables, rice', 'M110', 'lunch', 2),
  ('greater-heights', 'Grilled Lamb Chops', 'Herb-crusted lamb with roasted vegetables', 'M165', 'dinner', 0),
  ('greater-heights', 'Pan-Seared Salmon', 'With lemon butter sauce and mashed potatoes', 'M155', 'dinner', 1),
  ('greater-heights', 'Vegetable Stir-Fry', 'Fresh seasonal vegetables with rice or noodles', 'M95', 'dinner', 2),
  ('new-heights', 'Full English Breakfast', 'Eggs, bacon, sausage, toast, grilled tomato', 'M85', 'breakfast', 0),
  ('new-heights', 'Continental Breakfast', 'Croissants, fruit, yogurt, cereals, juice', 'M65', 'breakfast', 1),
  ('new-heights', 'African Breakfast', 'Traditional porridge, bread, eggs, tea', 'M55', 'breakfast', 2),
  ('new-heights', 'Grilled Chicken Salad', 'Mixed greens, grilled chicken, vinaigrette', 'M95', 'lunch', 0),
  ('new-heights', 'Club Sandwich', 'Triple-decker with fries and coleslaw', 'M85', 'lunch', 1),
  ('new-heights', 'Beef Stew', 'Slow-cooked beef with seasonal vegetables, rice', 'M110', 'lunch', 2),
  ('new-heights', 'Grilled Lamb Chops', 'Herb-crusted lamb with roasted vegetables', 'M165', 'dinner', 0),
  ('new-heights', 'Pan-Seared Salmon', 'With lemon butter sauce and mashed potatoes', 'M155', 'dinner', 1),
  ('new-heights', 'Vegetable Stir-Fry', 'Fresh seasonal vegetables with rice or noodles', 'M95', 'dinner', 2);

-- Seed default room prices
INSERT INTO public.room_prices (guest_house, room_type, price, price_note, description, features, display_order) VALUES
  ('greater-heights', 'Single Room', 'M400.00', 'per night', 'Cozy and modern, perfect for solo travellers seeking comfort and convenience.', ARRAY['1 Single Bed', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included'], 0),
  ('greater-heights', 'Couple Room', 'M550.00', 'per night', 'A romantic retreat with elegant furnishings and premium amenities for couples.', ARRAY['1 King Bed', 'Free WiFi', 'En-Suite Bathroom', 'City View'], 1),
  ('greater-heights', 'Sharing Room', 'M650.00', 'per night', 'Spacious accommodation ideal for friends or colleagues travelling together.', ARRAY['2 Single Beds', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included'], 2),
  ('greater-heights', 'Conference & Banqueting', 'Custom Quote', NULL, 'Professional conferencing facilities with modern AV equipment and catering options.', ARRAY['AV Equipment', 'Catering Available', 'Flexible Layouts', 'Free Parking'], 3),
  ('new-heights', 'Single Room', 'M400.00', 'per night', 'Cozy and modern, perfect for solo travellers seeking comfort and convenience.', ARRAY['1 Single Bed', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included'], 0),
  ('new-heights', 'Couple Room', 'M550.00', 'per night', 'A romantic retreat with elegant furnishings and premium amenities for couples.', ARRAY['1 King Bed', 'Free WiFi', 'En-Suite Bathroom', 'City View'], 1),
  ('new-heights', 'Sharing Room', 'M650.00', 'per night', 'Spacious accommodation ideal for friends or colleagues travelling together.', ARRAY['2 Single Beds', 'Free WiFi', 'En-Suite Bathroom', 'Breakfast Included'], 2),
  ('new-heights', 'Conference & Banqueting', 'Custom Quote', NULL, 'Professional conferencing facilities with modern AV equipment and catering options.', ARRAY['AV Equipment', 'Catering Available', 'Flexible Layouts', 'Free Parking'], 3);

-- Seed contact settings for both houses
INSERT INTO public.contact_settings (guest_house, phone, email, whatsapp, address) VALUES
  ('greater-heights', '+266 0000 0000', 'info@greaterheights.co.ls', '+26600000000', 'Maseru, Lesotho'),
  ('new-heights', '+266 0000 0000', 'info@newheights.co.ls', '+26600000000', 'Maseru, Lesotho')
ON CONFLICT DO NOTHING;
