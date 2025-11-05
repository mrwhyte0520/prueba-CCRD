import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

export interface ReporteIT1 {
  id: string
  empresa_id: string
  periodo: string
  rnc_contraparte: string
  nombre_contraparte: string
  tipo_operacion: string
  fecha_operacion: Date
  descripcion_operacion?: string
  monto_operacion: number
  moneda: string
  created_at: Date
}

export async function getReportesIT1(empresaId: string, periodo: string): Promise<ReporteIT1[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reportes_it1")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("fecha_operacion", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllReportesIT1(): Promise<ReporteIT1[]> {
  return getReportesIT1(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createReporteIT1(
  empresaId: string,
  data: Omit<ReporteIT1, "id" | "empresa_id" | "created_at">,
): Promise<ReporteIT1> {
  const supabase = createClient()
  const { data: reporte, error } = await supabase
    .from("reportes_it1")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return reporte
}

export async function deleteReporteIT1(reporteId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("reportes_it1").delete().eq("id", reporteId)

  if (error) throw error
}
