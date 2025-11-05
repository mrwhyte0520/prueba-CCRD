import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export interface TSSNovedad {
  id: string
  empresa_id: string
  periodo: string
  empleado_id: string
  tipo_novedad: string
  fecha_novedad: Date
  salario_anterior?: number
  salario_nuevo?: number
  motivo?: string
  observaciones?: string
  created_at: Date
}

export interface TSSNomina {
  id: string
  empresa_id: string
  periodo: string
  empleado_id: string
  cedula: string
  nss?: string
  nombre_empleado: string
  fecha_ingreso: Date
  salario_cotizable: number
  dias_laborados: number
  afp_empleado: number
  afp_empleador: number
  sfs_empleado: number
  sfs_empleador: number
  srl_empleador: number
  infotep: number
  total_aportes: number
  created_at: Date
}

// TSS Novedades
export async function getTSSNovedades(empresaId: string, periodo: string): Promise<TSSNovedad[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tss_novedades")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("fecha_novedad", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllTSSNovedades(): Promise<TSSNovedad[]> {
  return getTSSNovedades(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createTSSNovedad(
  empresaId: string,
  data: Omit<TSSNovedad, "id" | "empresa_id" | "created_at">,
): Promise<TSSNovedad> {
  const supabase = createClient()
  const { data: novedad, error } = await supabase
    .from("tss_novedades")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return novedad
}

export async function deleteTSSNovedad(novedadId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("tss_novedades").delete().eq("id", novedadId)

  if (error) throw error
}

// TSS Nóminas
export async function getTSSNominas(empresaId: string, periodo: string): Promise<TSSNomina[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tss_nominas")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("nombre_empleado", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAllTSSNominas(): Promise<TSSNomina[]> {
  return getTSSNominas(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createTSSNomina(
  empresaId: string,
  data: Omit<TSSNomina, "id" | "empresa_id" | "created_at">,
): Promise<TSSNomina> {
  const supabase = createClient()
  const { data: nomina, error } = await supabase
    .from("tss_nominas")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return nomina
}

export async function generateTSSNomina(empresaId: string, periodo: string): Promise<TSSNomina[]> {
  const supabase = createClient()

  // Generar nómina TSS desde empleados activos
  const { data: empleados, error } = await supabase
    .from("empleados")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("estado", "activo")

  if (error) throw error

  const nominas: Omit<TSSNomina, "id" | "created_at">[] = (empleados || []).map((empleado: any) => {
    const salarioCotizable = empleado.salario
    const afpEmpleado = salarioCotizable * 0.0287
    const afpEmpleador = salarioCotizable * 0.071
    const sfsEmpleado = salarioCotizable * 0.0304
    const sfsEmpleador = salarioCotizable * 0.0709
    const srlEmpleador = salarioCotizable * 0.0116
    const infotep = salarioCotizable * 0.01

    return {
      empresa_id: empresaId,
      periodo,
      empleado_id: empleado.id,
      cedula: empleado.cedula,
      nss: empleado.nss,
      nombre_empleado: empleado.nombre,
      fecha_ingreso: empleado.fecha_ingreso,
      salario_cotizable: salarioCotizable,
      dias_laborados: 30,
      afp_empleado: afpEmpleado,
      afp_empleador: afpEmpleador,
      sfs_empleado: sfsEmpleado,
      sfs_empleador: sfsEmpleador,
      srl_empleador: srlEmpleador,
      infotep,
      total_aportes: afpEmpleado + afpEmpleador + sfsEmpleado + sfsEmpleador + srlEmpleador + infotep,
    }
  })

  // Insertar nóminas generadas
  const { data: insertedNominas, error: insertError } = await supabase.from("tss_nominas").insert(nominas).select()

  if (insertError) throw insertError
  return insertedNominas || []
}

export async function deleteTSSNomina(nominaId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("tss_nominas").delete().eq("id", nominaId)

  if (error) throw error
}
