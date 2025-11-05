-- Create accounting entries table
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  reference TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'posted', 'void'
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_number)
);

-- Create accounting entry lines table
CREATE TABLE IF NOT EXISTS public.accounting_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.accounting_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  debit NUMERIC(12,2) DEFAULT 0,
  credit NUMERIC(12,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entry_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entries
CREATE POLICY "accounting_entries_select_own" ON public.accounting_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounting_entries_insert_own" ON public.accounting_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounting_entries_update_own" ON public.accounting_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounting_entries_delete_own" ON public.accounting_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for entry lines
CREATE POLICY "accounting_entry_lines_select_own" ON public.accounting_entry_lines FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.accounting_entries WHERE id = entry_id AND user_id = auth.uid()));
CREATE POLICY "accounting_entry_lines_insert_own" ON public.accounting_entry_lines FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.accounting_entries WHERE id = entry_id AND user_id = auth.uid()));
CREATE POLICY "accounting_entry_lines_update_own" ON public.accounting_entry_lines FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.accounting_entries WHERE id = entry_id AND user_id = auth.uid()));
CREATE POLICY "accounting_entry_lines_delete_own" ON public.accounting_entry_lines FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.accounting_entries WHERE id = entry_id AND user_id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accounting_entries_user_id ON public.accounting_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_date ON public.accounting_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_accounting_entry_lines_entry_id ON public.accounting_entry_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entry_lines_account_id ON public.accounting_entry_lines(account_id);
