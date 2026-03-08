
-- Add is_public flag to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- Drop old permissive policy
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;

-- Create new restrictive policy that only exposes public settings
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (is_public = true);
