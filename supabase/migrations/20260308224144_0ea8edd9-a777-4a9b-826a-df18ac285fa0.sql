
-- Create design-previews storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-previews', 'design-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to design-previews
CREATE POLICY "Anyone can upload design previews"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'design-previews');

-- Allow anyone to read design previews
CREATE POLICY "Anyone can read design previews"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'design-previews');
