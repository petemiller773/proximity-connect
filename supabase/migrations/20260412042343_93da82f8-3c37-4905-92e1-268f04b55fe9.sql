
-- Add verification and onboarding columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS is_profile_complete boolean NOT NULL DEFAULT false;

-- Prevent users from setting is_verified directly via UPDATE
-- Drop the existing update policy and replace with a restricted one
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- If is_verified is changing, block it (only edge function with service role can do this)
    (is_verified IS NOT DISTINCT FROM (SELECT is_verified FROM public.profiles WHERE user_id = auth.uid()))
  )
);

-- Update handle_new_user to set is_profile_complete = false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url, is_profile_complete)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    false
  );
  RETURN NEW;
END;
$$;

-- Create avatar-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar-photos', 'avatar-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatar-photos
CREATE POLICY "Anyone can view avatar photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatar-photos');

CREATE POLICY "Authenticated users can upload their avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatar-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatar-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatar-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
