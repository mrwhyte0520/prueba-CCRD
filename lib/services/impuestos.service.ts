import { supabase } from "@/lib/supabaseClient"

export interface ConfiguracionImpuesto {
  id: string
  empresa_id: string
  tipo_impuesto: "itbis" | "isr" | "tss" | "otros"
  tasa: number
  descripcion: string | null
  activo: boolean
  created_at?: string
}

export interface DeclaracionImpuesto {
  id: string
  empresa_id: string
  tipo: "606" | "607" | "608" | "ir17" | "ir3" | "it1" | "tss"
  periodo: string
  fecha_presentacion: string | null
  monto_declarado: number
  monto_pagado: number
  estado: "borrador" | "presentada" | "pagada"
  archivo_url: string | null
  created_at?: string
}

// Get declaraciones de impuestos
export async function getDeclaracionesImpuestos(empresaId: string) {
  const { data, error } = await supabase
    .from("declaraciones_impuestos")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("periodo", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching declaraciones:", error)
    throw error
  }

  return data
}

// Create declaracion de impuesto
export async function createDeclaracionImpuesto(
  empresaId: string,
  declaracionData: Omit<DeclaracionImpuesto, "id" | "empresa_id">,
) {
  const { data, error } = await supabase
    .from("declaraciones_impuestos")
    .insert({
      empresa_id: empresaId,
      ...declaracionData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating declaracion:", error)
    throw error
  }

  return data
}

// Update declaracion status
export async function updateDeclaracionEstado(
  declaracionId: string,
  empresaId: string,
  estado: "borrador" | "presentada" | "pagada",
) {
  const { data, error } = await supabase
    .from("declaraciones_impuestos")
    .update({ estado })
    .eq("id", declaracionId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating declaracion estado:", error)
    throw error
  }

  return data
}

// Generate 606 report (purchases)
export async function generar606(empresaId: string, periodo: string) {
  const [year, month] = periodo.split("-")
  const startDate = `${year}-${month}-01`
  const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("facturas_compra")
    .select(`
      *,
      suplidores:suplidor_id (
        nombre,
        rnc
      )
    `)
    .eq("empresa_id", empresaId)
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .order("fecha", { ascending: true })

  if (error) {
    console.error("[v0] Error generating 606:", error)
    throw error
  }

  return data
}

// Generate 607 report (sales)
export async function generar607(empresaId: string, periodo: string) {
  const [year, month] = periodo.split("-")
  const startDate = `${year}-${month}-01`
  const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("facturas")
    .select(`
      *,
      clientes:cliente_id (
        nombre,
        rnc
      )
    `)
    .eq("empresa_id", empresaId)
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .order("fecha", { ascending: true })

  if (error) {
    console.error("[v0] Error generating 607:", error)
    throw error
  }

  return data
}

// Get reportes 607 (sales)
export async function getReportes607(empresaId: string, periodo?: string) {
  let query = supabase.from("reportes_607").select("*").eq("empresa_id", empresaId).order("fecha", { ascending: false })

  if (periodo) {
    const [year, month] = periodo.split("-")
    const startDate = `${year}-${month}-01`
    const endDate = new Date(Number.parseInt(year), Number.parseInt(month) + 1, 0).toISOString().split("T")[0]
    query = query.gte("fecha", startDate).lte("fecha", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching reportes 607:", error)
    throw error
  }

  return data
}

// Create reporte 607
export async function createReporte607(
  empresaId: string,
  reporteData: {
    rnc_cedula: string
    tipo_comprobante: string
    ncf: string
    fecha: string
    cliente: string
    monto_gravado: number
    itbis: number
  },
) {
  const total = reporteData.monto_gravado + reporteData.itbis

  const { data, error } = await supabase
    .from("reportes_607")
    .insert({
      empresa_id: empresaId,
      ...reporteData,
      total,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating reporte 607:", error)
    throw error
  }

  return data
}

// Delete reporte 607
export async function deleteReporte607(reporteId: string, empresaId: string) {
  const { error } = await supabase.from("reportes_607").delete().eq("id", reporteId).eq("empresa_id", empresaId)

  if (error) {
    console.error("[v0] Error deleting reporte 607:", error)
    throw error
  }
}

// Get reportes 608 (cancellations)
export async function getReportes608(empresaId: string, periodo?: string) {
  let query = supabase
    .from("reportes_608")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("fecha_emision_ncf_anulado", { ascending: false })

  if (periodo) {
    query = query.eq("periodo", periodo)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching reportes 608:", error)
    throw error
  }

  return data
}

// Create reporte 608
export async function createReporte608(
  empresaId: string,
  reporteData: {
    periodo: string
    ncf_anulado: string
    fecha_emision_ncf_anulado: string
    tipo_anulacion: string
    ncf_modificado?: string
    fecha_emision_ncf_modificado?: string
    monto_facturado: number
    itbis_facturado: number
    motivo_anulacion: string
  },
) {
  const { data, error } = await supabase
    .from("reportes_608")
    .insert({
      empresa_id: empresaId,
      ...reporteData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating reporte 608:", error)
    throw error
  }

  return data
}

// Delete reporte 608
export async function deleteReporte608(reporteId: string, empresaId: string) {
  const { error } = await supabase.from("reportes_608").delete().eq("id", reporteId).eq("empresa_id", empresaId)

  if (error) {
    console.error("[v0] Error deleting reporte 608:", error)
    throw error
  }
}

// Get reportes 606 (purchases)
export async function getReporte606(year: number, month: number) {
  const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate = new Date(year, month, 0).toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("reportes_606")
    .select("*")
    .eq("empresa_id", PLACEHOLDER_EMPRESA_ID)
    .gte("fecha_comprobante", startDate)
    .lte("fecha_comprobante", endDate)
    .order("fecha_comprobante", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching reportes 606:", error)
    throw error
  }

  return data || []
}

// Create reporte 606
export async function createReporte606(reporteData: {
  rnc_proveedor: string
  tipo_comprobante: string
  ncf: string
  fecha_comprobante: string
  nombre_proveedor: string
  monto_facturado: number
  itbis_facturado: number
}) {
  const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

  const { data, error } = await supabase
    .from("reportes_606")
    .insert({
      empresa_id: PLACEHOLDER_EMPRESA_ID,
      ...reporteData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating reporte 606:", error)
    throw error
  }

  return data
}
export async function getConfiguracionImpuestos(empresaId: string) {
  const { data, error } = await supabase
    .from("configuracion_impuestos")
    .select("*")
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching configuracion impuestos:", error)
    throw error
  }

  return data
}

// Crear o actualizar configuración de impuestos
export async function upsertConfiguracionImpuesto(
  empresaId: string,
  config: {
    tipo_impuesto: "itbis" | "isr" | "tss" | "otros"
    tasa: number
    descripcion?: string | null
    activo: boolean
  }
) {
  const { data, error } = await supabase
    .from("configuracion_impuestos")
    .upsert({
      empresa_id: empresaId,
      ...config
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error upserting configuracion impuesto:", error)
    throw error
  }

  return data
}