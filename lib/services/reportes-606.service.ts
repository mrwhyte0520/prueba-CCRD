import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

export interface Reporte606 {
  id: string
  empresa_id: string
  periodo: string
  rnc_suplidor: string
  nombre_suplidor: string
  tipo_identificacion?: string
  ncf: string
  ncf_modificado?: string
  fecha_comprobante: Date
  fecha_pago?: Date
  monto_facturado: number
  itbis_facturado: number
  itbis_retenido: number
  itbis_percibido: number
  retencion_renta: number
  isr_percibido: number
  impuesto_selectivo: number
  otros_impuestos: number
  monto_propina: number
  created_at: Date
}

export async function getReportes606(empresaId: string, periodo: string): Promise<Reporte606[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reportes_606")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("fecha_comprobante", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllReportes606(): Promise<Reporte606[]> {
  return getReportes606(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createReporte606(
  empresaId: string,
  data: Omit<Reporte606, "id" | "empresa_id" | "created_at">,
): Promise<Reporte606> {
  const supabase = createClient()
  const { data: reporte, error } = await supabase
    .from("reportes_606")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return reporte
}

export async function generateReporte606(empresaId: string, periodo: string): Promise<Reporte606[]> {
  const supabase = createClient()

  // Generar reporte 606 desde órdenes de compra del período
  const [year, month] = periodo.split("-")
  const startDate = `${year}-${month}-01`
  const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().slice(0, 10)

  const { data: ordenes, error } = await supabase
    .from("ordenes_compra")
    .select(`
      *,
      suplidor:suplidores(rnc, nombre)
    `)
    .eq("empresa_id", empresaId)
    .gte("fecha", startDate)
    .lte("fecha", endDate)

  if (error) throw error

  const reportes: Omit<Reporte606, "id" | "created_at">[] = (ordenes || []).map((orden: any) => ({
    empresa_id: empresaId,
    periodo,
    rnc_suplidor: orden.suplidor?.rnc || "",
    nombre_suplidor: orden.suplidor?.nombre || "",
    tipo_identificacion: "RNC",
    ncf: orden.numero,
    fecha_comprobante: new Date(orden.fecha),
    monto_facturado: orden.subtotal,
    itbis_facturado: orden.itbis,
    itbis_retenido: 0,
    itbis_percibido: 0,
    retencion_renta: 0,
    isr_percibido: 0,
    impuesto_selectivo: 0,
    otros_impuestos: 0,
    monto_propina: 0,
  }))

  // Insertar reportes generados
  const { data: insertedReportes, error: insertError } = await supabase.from("reportes_606").insert(reportes).select()

  if (insertError) throw insertError
  return insertedReportes || []
}

export async function deleteReporte606(reporteId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("reportes_606").delete().eq("id", reporteId)

  if (error) throw error
}
