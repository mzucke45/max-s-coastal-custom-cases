
-- 1. orders: add explicit deny-all policy for client roles (service_role bypasses RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all client access to orders" ON public.orders;
CREATE POLICY "Deny all client access to orders"
  ON public.orders
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- 2. product-images storage bucket: restrict writes from client roles
DROP POLICY IF EXISTS "Deny client writes to product-images" ON storage.objects;
CREATE POLICY "Deny client writes to product-images"
  ON storage.objects
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (bucket_id <> 'product-images')
  WITH CHECK (bucket_id <> 'product-images');
