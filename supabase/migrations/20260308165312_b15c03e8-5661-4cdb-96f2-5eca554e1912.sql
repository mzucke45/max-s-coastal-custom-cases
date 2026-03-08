
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS phone_model text DEFAULT '',
ADD COLUMN IF NOT EXISTS design_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS design_image_url text DEFAULT '';
