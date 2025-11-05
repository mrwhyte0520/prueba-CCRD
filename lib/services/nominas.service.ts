import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

export interface Nomina {
  id: string
  empresa_id: string
  periodo: string
  fecha_pago: Date
  tipo: string
  total_ingresos: number
  total_deducciones: number
  total_neto: number
  estado: string
  usuario_id?: string
  created_at: Date
  updated_at: Date
}

export interface NominaDetalle {
  id: string
  nomina_id: string
  empleado_id: string
  salario_base: number
  horas_extras: number
  bonificaciones: number
  comisiones: number
  total_ingresos: number
  afp: number
  sfs: number
  isr: number
  prestamos: number
  otras_deducciones: number
  total_deducciones: number
  neto_pagar: number
  created_at: Date
}

export async function getNominas(empresaId: string): Promise<Nomina[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("nominas")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("fecha_pago", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllNominas(): Promise<Nomina[]> {
  return getNominas(PLACEHOLDER_EMPRESA_ID)
}

export async function getNominaById(nominaId: string): Promise<Nomina | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("nominas").select("*").eq("id", nominaId).single()

  if (error) throw error
  return data
}

export async function getNominaDetalle(nominaId: string): Promise<NominaDetalle[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("nominas_detalle")
    .select(`
      *,
      empleado:empleados(nombre, cedula, cargo)
    `)
    .eq("nomina_id", nominaId)

  if (error) throw error
  return data || []
}

export async function createNomina(
  empresaId: string,
  data: Omit<Nomina, "id" | "empresa_id" | "created_at" | "updated_at">,
): Promise<Nomina> {
  const supabase = createClient()
  const { data: nomina, error } = await supabase
    .from("nominas")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return nomina
}

export async function createNominaDetalle(
  nominaId: string,
  detalle: Omit<NominaDetalle, "id" | "nomina_id" | "created_at">,
): Promise<NominaDetalle> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("nominas_detalle")
    .insert({ ...detalle, nomina_id: nominaId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateNominaEstado(nominaId: string, estado: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("nominas").update({ estado }).eq("id", nominaId)

  if (error) throw error
}

export async function deleteNomina(nominaId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("nominas").delete().eq("id", nominaId)

  if (error) throw error
}

export async function calcularNomina(empresaId: string, periodo: string): Promise<NominaDetalle[]> {
  const supabase = createClient()

  // Obtener empleados activos
  const { data: empleados, error } = await supabase
    .from("empleados")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("estado", "activo")

  if (error) throw error

  // Calcular nómina para cada empleado
  const detalles: Omit<NominaDetalle, "id" | "nomina_id" | "created_at">[] = (empleados || []).map((empleado: any) => {
    const salarioBase = empleado.salario
    const horasExtras = 0
    const bonificaciones = 0
    const comisiones = 0
    const totalIngresos = salarioBase + horasExtras + bonificaciones + comisiones

    // Calcular deducciones
    const afp = totalIngresos * 0.0287
    const sfs = totalIngresos * 0.0304
    const isr = calcularISR(totalIngresos)
    const prestamos = 0
    const otrasDeducciones = 0
    const totalDeducciones = afp + sfs + isr + prestamos + otrasDeducciones

    return {
      empleado_id: empleado.id,
      salario_base: salarioBase,
      horas_extras: horasExtras,
      bonificaciones,
      comisiones,
      total_ingresos: totalIngresos,
      afp,
      sfs,
      isr,
      prestamos,
      otras_deducciones: otrasDeducciones,
      total_deducciones: totalDeducciones,
      neto_pagar: totalIngresos - totalDeducciones,
    }
  })

  return detalles as NominaDetalle[]
}

function calcularISR(ingresoMensual: number): number {
  const ingresoAnual = ingresoMensual * 12

  if (ingresoAnual <= 416220) return 0
  if (ingresoAnual <= 624329) return ((ingresoAnual - 416220) * 0.15) / 12
  if (ingresoAnual <= 867123) return (31216 + (ingresoAnual - 624329) * 0.2) / 12

  return (79776 + (ingresoAnual - 867123) * 0.25) / 12
}
