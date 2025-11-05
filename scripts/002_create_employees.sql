-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cedula TEXT,
  nss TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  department_id UUID,
  position TEXT,
  salary NUMERIC(12,2),
  hire_date DATE,
  termination_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, employee_code)
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "employees_select_own" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "employees_insert_own" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "employees_update_own" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "employees_delete_own" ON public.employees FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
