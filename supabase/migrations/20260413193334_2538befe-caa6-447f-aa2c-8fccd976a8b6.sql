
-- Add GPS columns and last_seen to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_location_update timestamp with time zone;

-- Create push_subscriptions table for web push notifications
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subscription jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
ON public.push_subscriptions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a function to find nearby users within a given radius (in miles)
CREATE OR REPLACE FUNCTION public.get_nearby_users(
  p_user_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_radius_miles double precision DEFAULT 2.5
)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  bio text,
  avatar_url text,
  is_verified boolean,
  latitude double precision,
  longitude double precision,
  distance_miles double precision,
  last_location_update timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.is_verified,
    p.latitude,
    p.longitude,
    (3959 * acos(
      cos(radians(p_lat)) * cos(radians(p.latitude)) *
      cos(radians(p.longitude) - radians(p_lng)) +
      sin(radians(p_lat)) * sin(radians(p.latitude))
    )) AS distance_miles,
    p.last_location_update
  FROM public.profiles p
  WHERE p.user_id != p_user_id
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.is_profile_complete = true
    AND p.last_location_update > now() - interval '5 minutes'
    AND (3959 * acos(
      cos(radians(p_lat)) * cos(radians(p.latitude)) *
      cos(radians(p.longitude) - radians(p_lng)) +
      sin(radians(p_lat)) * sin(radians(p.latitude))
    )) <= p_radius_miles
  ORDER BY distance_miles ASC;
$$;
