
-- Remove overly permissive listing policies. Public buckets still serve files via public URLs / CDN,
-- but dropping the SELECT policy on storage.objects prevents anonymous listing of bucket contents.
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read phone-mockups" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read design previews" ON storage.objects;

-- Remove unauthenticated write access to design-previews (designer feature removed).
DROP POLICY IF EXISTS "Anyone can upload design previews" ON storage.objects;

-- Remove misconfigured "service role" policies on phone-mockups that actually granted public write.
-- Admin edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS, so no replacement is needed.
DROP POLICY IF EXISTS "Service role upload phone-mockups" ON storage.objects;
DROP POLICY IF EXISTS "Service role update phone-mockups" ON storage.objects;
DROP POLICY IF EXISTS "Service role delete phone-mockups" ON storage.objects;
