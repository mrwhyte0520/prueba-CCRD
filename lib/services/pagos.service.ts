import { supabase } from "@/lib/supabaseClient"

// Get all pagos to suppliers
export async function getPagos(empresaId: string) {
  const { data, error } = await supabase
    .from("pagos_suplidores")
    .select(`
      *,
      suplidores (
        id,
        nombre,
        rnc
      )
    `)
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })

  if (error) throw error
  return data || []
}

// Wrapper function for compatibility
export async function getAllPagos() {
  // TODO: Get empresaId from authenticated user
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getPagos(empresaId)
}

// Create a new pago to supplier
export async function createPago(pago: {
  suplidor_id: string
  fecha: string
  monto: number
  metodo_pago: string
  referencia?: string
  notas?: string
}) {
  // TODO: Get empresaId from authenticated user
  const empresaId = "00000000-0000-0000-0000-000000000000"

  // Generate next pago number
  const { data: lastPago } = await supabase
    .from("pagos_suplidores")
    .select("numero")
    .eq("empresa_id", empresaId)
    .order("numero", { ascending: false })
    .limit(1)
    .single()

  const nextNumber = lastPago?.numero
    ? String(Number.parseInt(lastPago.numero.replace(/\D/g, "")) + 1).padStart(6, "0")
    : "000001"
  const numeroPago = `PAG-${nextNumber}`

  // Create the pago
  const { data: newPago, error: pagoError } = await supabase
    .from("pagos_suplidores")
    .insert({
      empresa_id: empresaId,
      suplidor_id: pago.suplidor_id,
      numero: numeroPago,
      fecha: pago.fecha,
      monto: pago.monto,
      metodo_pago: pago.metodo_pago,
      referencia: pago.referencia,
      notas: pago.notas,
    })
    .select()
    .single()

  if (pagoError) throw pagoError

  return newPago
}

// Get pagos by supplier
export async function getPagosBySuplidor(suplidorId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("pagos_suplidores")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("suplidor_id", suplidorId)
    .order("fecha", { ascending: false })

  if (error) throw error
  return data || []
}

// Get pagos by date range
export async function getPagosByDateRange(fechaInicio: string, fechaFin: string, empresaId: string) {
  const { data, error } = await supabase
    .from("pagos_suplidores")
    .select(`
      *,
      suplidores (
        id,
        nombre,
        rnc
      )
    `)
    .eq("empresa_id", empresaId)
    .gte("fecha", fechaInicio)
    .lte("fecha", fechaFin)
    .order("fecha", { ascending: false })

  if (error) throw error
  return data || []
}

// Delete a pago
export async function deletePago(pagoId: string) {
  const { error } = await supabase.from("pagos_suplidores").delete().eq("id", pagoId)

  if (error) throw error
}
