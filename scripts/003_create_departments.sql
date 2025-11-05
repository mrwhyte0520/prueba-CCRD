-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  manager_id UUID,
  budget NUMERIC(12,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "departments_select_own" ON public.departments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "departments_insert_own" ON public.departments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "departments_update_own" ON public.departments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "departments_delete_own" ON public.departments FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON public.departments(user_id);
