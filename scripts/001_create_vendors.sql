-- Create vendors (suplidores) table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tax_id TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_person TEXT,
  vendor_type TEXT,
  payment_terms INTEGER DEFAULT 30,
  credit_limit NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "vendors_select_own" ON public.vendors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "vendors_insert_own" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vendors_update_own" ON public.vendors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "vendors_delete_own" ON public.vendors FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
