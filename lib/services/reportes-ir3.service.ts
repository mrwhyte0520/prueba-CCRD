import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

export interface ReporteIR3 {
  id: string
  empresa_id: string
  periodo: string
  nombre_beneficiario: string
  pais_beneficiario: string
  tipo_documento?: string
  numero_documento?: string
  fecha_pago: Date
  concepto_pago: string
  tipo_renta: string
  monto_pago_usd: number
  monto_pago_dop: number
  tasa_cambio: number
  tasa_retencion: number
  retencion_isr: number
  convenio_doble_tributacion: boolean
  created_at: Date
}

export async function getReportesIR3(empresaId: string, periodo: string): Promise<ReporteIR3[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reportes_ir3")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("fecha_pago", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllReportesIR3(): Promise<ReporteIR3[]> {
  return getReportesIR3(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createReporteIR3(
  empresaId: string,
  data: Omit<ReporteIR3, "id" | "empresa_id" | "created_at">,
): Promise<ReporteIR3> {
  const supabase = createClient()
  const { data: reporte, error } = await supabase
    .from("reportes_ir3")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return reporte
}

export async function deleteReporteIR3(reporteId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("reportes_ir3").delete().eq("id", reporteId)

  if (error) throw error
}
