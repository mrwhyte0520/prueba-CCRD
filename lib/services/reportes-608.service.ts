import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

export interface Reporte608 {
  id: string
  empresa_id: string
  periodo: string
  ncf_anulado: string
  fecha_emision_ncf_anulado: Date
  tipo_anulacion: string
  ncf_modificado?: string
  fecha_emision_ncf_modificado?: Date
  monto_facturado: number
  itbis_facturado: number
  motivo_anulacion?: string
  created_at: Date
}

export async function getReportes608(empresaId: string, periodo: string): Promise<Reporte608[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reportes_608")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("fecha_emision_ncf_anulado", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllReportes608(): Promise<Reporte608[]> {
  return getReportes608(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createReporte608(
  empresaId: string,
  data: Omit<Reporte608, "id" | "empresa_id" | "created_at">,
): Promise<Reporte608> {
  const supabase = createClient()
  const { data: reporte, error } = await supabase
    .from("reportes_608")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return reporte
}

export async function deleteReporte608(reporteId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("reportes_608").delete().eq("id", reporteId)

  if (error) throw error
}
