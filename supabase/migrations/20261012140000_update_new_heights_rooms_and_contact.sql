DELETE FROM public.room_images
WHERE guest_house = 'new-heights'
  AND room_type = 'Executive Room';

DELETE FROM public.room_prices
WHERE guest_house = 'new-heights'
  AND room_type = 'Executive Room';

UPDATE public.contact_settings
SET
  phone = '+266 22320656',
  whatsapp = '+266 57035583 / +266 63490001',
  email = 'newheightsguesthouse@gmail.com'
WHERE guest_house = 'new-heights';