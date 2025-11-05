-- Create receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  receipt_type TEXT NOT NULL, -- 'income' or 'expense'
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT,
  reference_id UUID, -- customer_id or vendor_id
  reference_name TEXT,
  concept TEXT,
  notes TEXT,
  receipt_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, receipt_number)
);

-- Enable RLS
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "receipts_select_own" ON public.receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receipts_insert_own" ON public.receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "receipts_update_own" ON public.receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "receipts_delete_own" ON public.receipts FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_type ON public.receipts(receipt_type);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON public.receipts(receipt_date);
