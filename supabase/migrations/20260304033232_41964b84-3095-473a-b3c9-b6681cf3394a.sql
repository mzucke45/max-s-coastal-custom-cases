
-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  collection_id UUID,
  gelato_product_uid TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from products to collections
ALTER TABLE public.products
  ADD CONSTRAINT fk_products_collection
  FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE SET NULL;

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gelato_order_id TEXT,
  customer_email TEXT NOT NULL DEFAULT '',
  customer_name TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site settings table for admin content editing
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: products and collections are publicly readable
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Collections are publicly readable" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);

-- Orders: no public access (managed via edge functions with service role)
-- Admin writes via edge functions using service role key

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Allow public read on product-images
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allow uploads via service role (edge functions handle this)
