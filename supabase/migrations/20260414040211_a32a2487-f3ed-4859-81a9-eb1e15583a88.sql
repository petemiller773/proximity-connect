ALTER TABLE public.profiles ADD COLUMN is_premium boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN stripe_customer_id text DEFAULT null;