
-- Create admin user via auth
-- Password: Admin@2026!
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert user into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@greaterheights.co.ls',
    crypt('Admin@2026!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create identity for the user
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    new_user_id,
    (SELECT email FROM auth.users WHERE id = new_user_id),
    jsonb_build_object('sub', new_user_id::text, 'email', 'admin@greaterheights.co.ls'),
    'email',
    now(), now(), now()
  );

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'admin');
END $$;
