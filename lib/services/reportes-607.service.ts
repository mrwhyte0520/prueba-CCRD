import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

export interface Reporte607 {
  id: string
  empresa_id: string
  periodo: string
  rnc_cliente?: string
  nombre_cliente?: string
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
  tipo_venta: string
  created_at: Date
}

export async function getReportes607(empresaId: string, periodo: string): Promise<Reporte607[]> {
  if (!empresaId || !periodo) {
    console.warn("[getReportes607] empresaId o periodo no definidos:", { empresaId, periodo })
    return []
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("reportes_607")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .order("fecha_comprobante", { ascending: false })

  if (error) {
    console.error("[Supabase error en getReportes607]", error)
    throw new Error(`Error al obtener reportes 607: ${JSON.stringify(error)}`)
  }

  if (!data || data.length === 0) {
    console.warn("[getReportes607] No se encontraron registros para:", { empresaId, periodo })
  }

  return data || []
}


export async function getAllReportes607(): Promise<Reporte607[]> {
  return getReportes607(PLACEHOLDER_EMPRESA_ID, new Date().toISOString().slice(0, 7))
}

export async function createReporte607(
  empresaId: string,
  data: Omit<Reporte607, "id" | "empresa_id" | "created_at">,
): Promise<Reporte607> {
  const supabase = createClient()
  const { data: reporte, error } = await supabase
    .from("reportes_607")
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) throw error
  return reporte
}

export async function generateReporte607(empresaId: string, periodo: string): Promise<Reporte607[]> {
  const supabase = createClient()

  // Generar reporte 607 desde facturas del período
  const [year, month] = periodo.split("-")
  const startDate = `${year}-${month}-01`
  const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().slice(0, 10)

  const { data: facturas, error } = await supabase
    .from("facturas")
    .select(`
      *,
      cliente:clientes(rnc_cedula, nombre, tipo_identificacion)
    `)
    .eq("empresa_id", empresaId)
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .neq("estado", "anulada")

  if (error) throw error

  const reportes: Omit<Reporte607, "id" | "created_at">[] = (facturas || []).map((factura: any) => ({
    empresa_id: empresaId,
    periodo,
    rnc_cliente: factura.cliente?.rnc_cedula || "",
    nombre_cliente: factura.cliente?.nombre || "",
    tipo_identificacion: factura.cliente?.tipo_identificacion || "CEDULA",
    ncf: factura.ncf || factura.numero,
    fecha_comprobante: new Date(factura.fecha),
    monto_facturado: factura.subtotal,
    itbis_facturado: factura.itbis,
    itbis_retenido: 0,
    itbis_percibido: 0,
    retencion_renta: 0,
    isr_percibido: 0,
    impuesto_selectivo: 0,
    otros_impuestos: 0,
    monto_propina: 0,
    tipo_venta: "venta",
  }))

  // Insertar reportes generados
  const { data: insertedReportes, error: insertError } = await supabase.from("reportes_607").insert(reportes).select()

  if (insertError) throw insertError
  return insertedReportes || []
}

export async function deleteReporte607(reporteId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("reportes_607").delete().eq("id", reporteId)

  if (error) throw error
}
