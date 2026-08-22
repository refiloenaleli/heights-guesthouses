-- Ensure the accommodation catalog exists for both guest houses.
-- Existing rows are updated; missing room types are inserted.

UPDATE public.room_prices
SET
  price = 'M600.00',
  price_note = 'per night',
  description = 'A peaceful, comfortable room for solo travellers, with everything you need for a restful stay.',
  features = ARRAY['1 Single Bed', 'En-Suite Bathroom', 'Breakfast Included', 'Tea/Coffee Facilities'],
  display_order = 0
WHERE room_type = 'Single Room'
  AND guest_house IN ('greater-heights', 'new-heights');

UPDATE public.room_prices
SET
  price = 'M700.00',
  price_note = 'per night',
  description = 'A warm and inviting retreat for couples, with generous space and thoughtful amenities.',
  features = ARRAY['1 King Bed', 'En-Suite Bathroom', 'Breakfast Included', 'Mini-Fridge'],
  display_order = 1
WHERE room_type = 'Couple Room'
  AND guest_house IN ('greater-heights', 'new-heights');

UPDATE public.room_prices
SET
  price = 'M750.00',
  price_note = 'per night',
  description = 'Spacious accommodation for friends or colleagues travelling together without compromising comfort.',
  features = ARRAY['2 Single Beds', 'En-Suite Bathroom', 'Breakfast Included', 'Individual Reading Lights'],
  display_order = 2
WHERE room_type = 'Sharing Room'
  AND guest_house IN ('greater-heights', 'new-heights');

UPDATE public.room_prices
SET
  price = 'M850.00',
  price_note = 'per night',
  description = 'Our premium room with extra space, elevated amenities, and a more spacious setting.',
  features = ARRAY['Super King Bed', 'En-Suite Bathroom', 'Breakfast Included', 'Separate Sitting Area'],
  display_order = 3
WHERE room_type = 'Executive Room'
  AND guest_house IN ('greater-heights', 'new-heights');

INSERT INTO public.room_prices (
  guest_house,
  room_type,
  price,
  price_note,
  description,
  features,
  display_order
)
SELECT houses.guest_house, rooms.room_type, rooms.price, 'per night', rooms.description, rooms.features, rooms.display_order
FROM (
  VALUES
    ('greater-heights'),
    ('new-heights')
) AS houses(guest_house)
CROSS JOIN (
  VALUES
    ('Single Room', 'M600.00', 'A peaceful, comfortable room for solo travellers, with everything you need for a restful stay.', ARRAY['1 Single Bed', 'En-Suite Bathroom', 'Breakfast Included', 'Tea/Coffee Facilities']::text[], 0),
    ('Couple Room', 'M700.00', 'A warm and inviting retreat for couples, with generous space and thoughtful amenities.', ARRAY['1 King Bed', 'En-Suite Bathroom', 'Breakfast Included', 'Mini-Fridge']::text[], 1),
    ('Sharing Room', 'M750.00', 'Spacious accommodation for friends or colleagues travelling together without compromising comfort.', ARRAY['2 Single Beds', 'En-Suite Bathroom', 'Breakfast Included', 'Individual Reading Lights']::text[], 2),
    ('Executive Room', 'M850.00', 'Our premium room with extra space, elevated amenities, and a more spacious setting.', ARRAY['Super King Bed', 'En-Suite Bathroom', 'Breakfast Included', 'Separate Sitting Area']::text[], 3)
) AS rooms(room_type, price, description, features, display_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.room_prices existing
  WHERE existing.guest_house = houses.guest_house
    AND existing.room_type = rooms.room_type
);
