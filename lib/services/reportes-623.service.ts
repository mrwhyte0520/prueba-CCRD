import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

export interface Reporte623 {
  id: string
  empresa_id: string
  periodo: string
  rnc_beneficiario: string
  nombre_beneficiario: string
  tipo_identificacion?: string
  fecha_pago: Date
  tipo_renta: string
  descripcion_renta?: string
  monto_pago: number
  retencion_isr: number
  norma_aplicada?: string
  created_at: Date
}

export async function getReportes623(empresaId: string, periodo: string): Promise<Reporte623[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reportes_623")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("fecha_pago", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllReportes623(): Promise<Reporte623[]> {
  return getReportes623(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createReporte623(
  empresaId: string,
  data: Omit<Reporte623, "id" | "empresa_id" | "created_at">,
): Promise<Reporte623> {
  const supabase = createClient()
  const { data: reporte, error } = await supabase
    .from("reportes_623")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return reporte
}

export async function deleteReporte623(reporteId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("reportes_623").delete().eq("id", reporteId)

  if (error) throw error
}
