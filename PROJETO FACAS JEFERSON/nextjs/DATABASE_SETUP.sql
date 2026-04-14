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
