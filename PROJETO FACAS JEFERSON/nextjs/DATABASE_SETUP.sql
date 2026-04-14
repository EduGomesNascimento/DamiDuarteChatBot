-- 🚀 Cutelaria Jeferson - Database Setup
-- Execute this in Supabase SQL Editor

-- 1️⃣ CREATE ADDRESSES TABLE
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Casa',
  recipient_name TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_default_per_user UNIQUE(user_id) WHERE is_default = true
);

-- 2️⃣ ENABLE ROW LEVEL SECURITY
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 3️⃣ CREATE RLS POLICY
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4️⃣ CREATE INDEXES for performance
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_addresses_is_default ON public.addresses(user_id, is_default);

-- 5️⃣ GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;

-- ✅ Done! You can now use the addresses table

-- ============================================================
-- 📸 STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================================
-- Run this ONLY in Supabase SQL Editor (Storage section)
-- OR create the bucket manually in Supabase Dashboard > Storage

-- Create bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,                                       -- public (images accessible via URL)
  5242880,                                    -- 5MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update/delete
CREATE POLICY "Admin can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Allow public read of product images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- ✅ Storage bucket ready!
