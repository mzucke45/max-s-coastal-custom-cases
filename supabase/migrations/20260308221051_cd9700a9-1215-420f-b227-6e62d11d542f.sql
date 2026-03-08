
-- Create phone_mockups table
CREATE TABLE public.phone_mockups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id text UNIQUE NOT NULL,
  back_image_url text DEFAULT '',
  overlay_image_url text DEFAULT '',
  case_area_x numeric DEFAULT 0.08,
  case_area_y numeric DEFAULT 0.04,
  case_area_width numeric DEFAULT 0.84,
  case_area_height numeric DEFAULT 0.92,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_mockups ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Phone mockups are publicly readable"
  ON public.phone_mockups
  FOR SELECT
  USING (true);

-- Create phone-mockups storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('phone-mockups', 'phone-mockups', true);

-- Allow public read on phone-mockups bucket
CREATE POLICY "Public read phone-mockups"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'phone-mockups');

-- Allow admin uploads via service role (edge function uses service role key)
CREATE POLICY "Service role upload phone-mockups"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'phone-mockups');

CREATE POLICY "Service role update phone-mockups"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'phone-mockups');

CREATE POLICY "Service role delete phone-mockups"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'phone-mockups');
