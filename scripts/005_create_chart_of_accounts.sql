-- Create chart of accounts table
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- 'asset', 'liability', 'equity', 'income', 'expense'
  parent_account_id UUID,
  level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, account_code)
);

-- Enable RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "chart_of_accounts_select_own" ON public.chart_of_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chart_of_accounts_insert_own" ON public.chart_of_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chart_of_accounts_update_own" ON public.chart_of_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "chart_of_accounts_delete_own" ON public.chart_of_accounts FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_user_id ON public.chart_of_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON public.chart_of_accounts(account_type);
