import { supabase } from "@/lib/supabaseClient"

export interface CierreCaja {
  id: string
  empresa_id: string
  fecha: string
  usuario_id: string
  efectivo_esperado: number
  efectivo_contado: number
  diferencia: number
  total_efectivo: number
  total_tarjeta: number
  total_transferencia: number
  total_cheque: number
  total_credito: number
  total_ventas: number
  observaciones: string | null
  created_at?: string
}

export interface VentasDelDia {
  efectivo: number
  tarjeta: number
  transferencia: number
  cheque: number
  credito: number
  total: number
}

// Get all cierres de caja for the current empresa
export async function getCierresCaja(empresaId: string) {
  const { data, error } = await supabase
    .from("cierres_caja")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching cierres de caja:", error)
    throw error
  }

  return data
}

// Get cierre de caja by date
export async function getCierreCajaByDate(empresaId: string, fecha: string) {
  const { data, error } = await supabase
    .from("cierres_caja")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("fecha", fecha)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("[v0] Error fetching cierre de caja:", error)
    throw error
  }

  return data
}

// Get ventas del día (sales summary for today)
export async function getVentasDelDia(empresaId: string, fecha: string): Promise<VentasDelDia> {
  const { data, error } = await supabase
    .from("facturas")
    .select("metodo_pago, total")
    .eq("empresa_id", empresaId)
    .eq("fecha", fecha)
    .neq("estado", "anulada")

  if (error) {
    console.error("[v0] Error fetching ventas del día:", error)
    throw error
  }

  const ventas: VentasDelDia = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    cheque: 0,
    credito: 0,
    total: 0,
  }

  data.forEach((factura) => {
    const metodo = factura.metodo_pago?.toLowerCase() || "efectivo"
    const total = factura.total || 0

    if (metodo.includes("efectivo")) {
      ventas.efectivo += total
    } else if (metodo.includes("tarjeta")) {
      ventas.tarjeta += total
    } else if (metodo.includes("transferencia")) {
      ventas.transferencia += total
    } else if (metodo.includes("cheque")) {
      ventas.cheque += total
    } else if (metodo.includes("credito") || metodo.includes("crédito")) {
      ventas.credito += total
    } else {
      ventas.efectivo += total // Default to efectivo
    }

    ventas.total += total
  })

  return ventas
}

// Get facturas del día for cierre
export async function getFacturasDelDia(empresaId: string, fecha: string) {
  const { data, error } = await supabase
    .from("facturas")
    .select(`
      numero,
      total,
      metodo_pago,
      clientes:cliente_id (
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .eq("fecha", fecha)
    .neq("estado", "anulada")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching facturas del día:", error)
    throw error
  }

  return data.map((factura) => ({
    numero: factura.numero,
    cliente: factura.clientes?.nombre || "Cliente General",
    total: factura.total,
    metodo: factura.metodo_pago || "Efectivo",
  }))
}

// Create cierre de caja
export async function createCierreCaja(
  empresaId: string,
  usuarioId: string,
  fecha: string,
  efectivoContado: number,
  observaciones?: string,
) {
  // Get ventas del día
  const ventas = await getVentasDelDia(empresaId, fecha)

  const efectivoEsperado = ventas.efectivo
  const diferencia = efectivoContado - efectivoEsperado

  const { data, error } = await supabase
    .from("cierres_caja")
    .insert({
      empresa_id: empresaId,
      fecha,
      usuario_id: usuarioId,
      efectivo_esperado: efectivoEsperado,
      efectivo_contado: efectivoContado,
      diferencia,
      total_efectivo: ventas.efectivo,
      total_tarjeta: ventas.tarjeta,
      total_transferencia: ventas.transferencia,
      total_cheque: ventas.cheque,
      total_credito: ventas.credito,
      total_ventas: ventas.total,
      observaciones: observaciones || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating cierre de caja:", error)
    throw error
  }

  return data
}

// Check if cierre already exists for date
export async function existeCierreCaja(empresaId: string, fecha: string): Promise<boolean> {
  const cierre = await getCierreCajaByDate(empresaId, fecha)
  return cierre !== null
}
