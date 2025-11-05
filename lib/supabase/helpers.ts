import { createClient } from "./client"

// Helper para obtener el user_id actual (mock por ahora)
export function getCurrentUserId(): string {
  // Por ahora usamos un ID fijo, en producción vendría de la sesión
  return "00000000-0000-0000-0000-000000000000"
}

// Customers (Clientes)
export async function getCustomers() {
  const supabase = createClient()
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createCustomer(customer: {
  name: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("customers")
    .insert([{ ...customer, user_id: getCurrentUserId() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCustomer(
  id: string,
  customer: Partial<{
    name: string
    tax_id?: string
    email?: string
    phone?: string
    address?: string
  }>,
) {
  const supabase = createClient()
  const { data, error } = await supabase.from("customers").update(customer).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteCustomer(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) throw error
}

// Vendors (Suplidores)
export async function getVendors() {
  const supabase = createClient()
  const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createVendor(vendor: {
  name: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  contact_person?: string
  vendor_type?: string
  payment_terms?: number
  credit_limit?: number
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vendors")
    .insert([{ ...vendor, user_id: getCurrentUserId() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateVendor(
  id: string,
  vendor: Partial<{
    name: string
    tax_id?: string
    email?: string
    phone?: string
    address?: string
    contact_person?: string
    vendor_type?: string
    payment_terms?: number
    credit_limit?: number
    status?: string
  }>,
) {
  const supabase = createClient()
  const { data, error } = await supabase.from("vendors").update(vendor).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteVendor(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("vendors").delete().eq("id", id)

  if (error) throw error
}

// Products (Productos)
export async function getProducts() {
  const supabase = createClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createProduct(product: {
  name: string
  description?: string
  sku?: string
  category?: string
  unit?: string
  price: number
  cost?: number
  stock_quantity?: number
  is_service?: boolean
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, user_id: getCurrentUserId() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(
  id: string,
  product: Partial<{
    name: string
    description?: string
    sku?: string
    category?: string
    unit?: string
    price: number
    cost?: number
    stock_quantity?: number
    is_service?: boolean
  }>,
) {
  const supabase = createClient()
  const { data, error } = await supabase.from("products").update(product).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) throw error
}

// Employees (Empleados)
export async function getEmployees() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("employees")
    .select("*, departments(name)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createEmployee(employee: {
  employee_code?: string
  cedula: string
  nss?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  position?: string
  department_id?: string
  salary?: number
  hire_date: string
  status?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("employees")
    .insert([{ ...employee, user_id: getCurrentUserId() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEmployee(
  id: string,
  employee: Partial<{
    employee_code?: string
    cedula: string
    nss?: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
    address?: string
    position?: string
    department_id?: string
    salary?: number
    hire_date: string
    status?: string
    termination_date?: string
  }>,
) {
  const supabase = createClient()
  const { data, error } = await supabase.from("employees").update(employee).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteEmployee(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("employees").delete().eq("id", id)

  if (error) throw error
}

// Departments (Departamentos)
export async function getDepartments() {
  const supabase = createClient()
  const { data, error } = await supabase.from("departments").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createDepartment(department: {
  code: string
  name: string
  description?: string
  manager_id?: string
  budget?: number
  status?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("departments")
    .insert([{ ...department, user_id: getCurrentUserId() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDepartment(
  id: string,
  department: Partial<{
    code: string
    name: string
    description?: string
    manager_id?: string
    budget?: number
    status?: string
  }>,
) {
  const supabase = createClient()
  const { data, error } = await supabase.from("departments").update(department).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteDepartment(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("departments").delete().eq("id", id)

  if (error) throw error
}
