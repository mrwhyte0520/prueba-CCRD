import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export interface Empleado {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  cedula: string
  fecha_nacimiento?: Date
  fecha_ingreso: Date
  cargo?: string
  departamento?: string
  salario: number
  tipo_salario: string
  telefono?: string
  email?: string
  direccion?: string
  estado: string
  created_at: Date
  updated_at: Date
}

export async function getEmpleados(empresaId: string): Promise<Empleado[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("empleados")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nombre", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAllEmpleados(): Promise<Empleado[]> {
  return getEmpleados(PLACEHOLDER_EMPRESA_ID)
}

export async function getEmpleadoById(empleadoId: string): Promise<Empleado | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("empleados").select("*").eq("id", empleadoId).single()

  if (error) throw error
  return data
}

export async function createEmpleado(
  empresaId: string,
  empleado: Omit<Empleado, "id" | "empresa_id" | "created_at" | "updated_at">,
): Promise<Empleado> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("empleados")
    .insert({ ...empleado, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEmpleado(empleadoId: string, empleado: Partial<Empleado>): Promise<Empleado> {
  const supabase = createClient()
  const { data, error } = await supabase.from("empleados").update(empleado).eq("id", empleadoId).select().single()

  if (error) throw error
  return data
}

export async function deleteEmpleado(empleadoId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("empleados").delete().eq("id", empleadoId)

  if (error) throw error
}

export async function getEmpleadosByDepartamento(empresaId: string, departamento: string): Promise<Empleado[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("empleados")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("departamento", departamento)
    .order("nombre", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getEmpleadosActivos(empresaId: string): Promise<Empleado[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("empleados")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("estado", "activo")
    .order("nombre", { ascending: true })

  if (error) throw error
  return data || []
}
