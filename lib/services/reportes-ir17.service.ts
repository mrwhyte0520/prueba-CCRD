import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export interface ReporteIR17 {
  id: string
  empresa_id: string
  periodo: string
  empleado_id?: string
  cedula: string
  nombre_empleado: string
  salario_bruto: number
  otras_remuneraciones: number
  total_ingresos: number
  afp: number
  sfs: number
  otras_deducciones: number
  total_deducciones: number
  renta_neta: number
  isr_retenido: number
  created_at: Date
}

export async function getReportesIR17(empresaId: string, periodo: string): Promise<ReporteIR17[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reportes_ir17")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("nombre_empleado", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAllReportesIR17(): Promise<ReporteIR17[]> {
  return getReportesIR17(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createReporteIR17(
  empresaId: string,
  data: Omit<ReporteIR17, "id" | "empresa_id" | "created_at">,
): Promise<ReporteIR17> {
  const supabase = createClient()
  const { data: reporte, error } = await supabase
    .from("reportes_ir17")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return reporte
}

export async function generateReporteIR17(empresaId: string, periodo: string): Promise<ReporteIR17[]> {
  const supabase = createClient()

  // Generar reporte IR-17 desde nóminas del período
  const { data: nominasDetalle, error } = await supabase
    .from("nominas_detalle")
    .select(`
      *,
      nomina:nominas!inner(periodo, empresa_id),
      empleado:empleados(cedula, nombre)
    `)
    .eq("nomina.empresa_id", empresaId)
    .eq("nomina.periodo", periodo)

  if (error) throw error

  const reportes: Omit<ReporteIR17, "id" | "created_at">[] = (nominasDetalle || []).map((detalle: any) => ({
    empresa_id: empresaId,
    periodo,
    empleado_id: detalle.empleado_id,
    cedula: detalle.empleado?.cedula || "",
    nombre_empleado: detalle.empleado?.nombre || "",
    salario_bruto: detalle.salario_base,
    otras_remuneraciones: (detalle.bonificaciones || 0) + (detalle.comisiones || 0),
    total_ingresos: detalle.total_ingresos,
    afp: detalle.afp,
    sfs: detalle.sfs,
    otras_deducciones: detalle.otras_deducciones,
    total_deducciones: detalle.total_deducciones,
    renta_neta: detalle.total_ingresos - detalle.total_deducciones,
    isr_retenido: detalle.isr,
  }))

  // Insertar reportes generados
  const { data: insertedReportes, error: insertError } = await supabase.from("reportes_ir17").insert(reportes).select()

  if (insertError) throw insertError
  return insertedReportes || []
}

export async function deleteReporteIR17(reporteId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("reportes_ir17").delete().eq("id", reporteId)

  if (error) throw error
}
