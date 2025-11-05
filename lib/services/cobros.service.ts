import { supabase } from "@/lib/supabaseClient"

// TODO: Get empresaId from authenticated user
const DEFAULT_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export async function getAllCobros() {
  return getCobros(DEFAULT_EMPRESA_ID)
}

export async function getCobros(empresaId: string) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select(`
      *,
      clientes (
        id,
        nombre,
        email
      ),
      facturas:factura_id (
        numero,
        total
      )
    `)
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching cobros:", error)
    throw error
  }

  return data || []
}

export async function getCobroById(id: string) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select(`
      *,
      clientes (
        id,
        nombre,
        email,
        telefono
      ),
      facturas:factura_id (
        numero,
        total
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching cobro:", error)
    throw error
  }

  return data
}

export async function createCobro(cobro: {
  cliente_id: string
  factura_id?: string
  fecha: string
  monto: number
  metodo_pago: string
  referencia?: string
}) {
  const { data: lastCobro } = await supabase
    .from("pagos_clientes")
    .select("numero")
    .eq("empresa_id", DEFAULT_EMPRESA_ID)
    .order("numero", { ascending: false })
    .limit(1)
    .single()

  const lastNumber = lastCobro?.numero ? Number.parseInt(lastCobro.numero.split("-")[1]) : 0
  const numero = `COB-${String(lastNumber + 1).padStart(6, "0")}`

  const { data: cobroData, error: cobroError } = await supabase
    .from("pagos_clientes")
    .insert({
      empresa_id: DEFAULT_EMPRESA_ID,
      cliente_id: cobro.cliente_id,
      factura_id: cobro.factura_id,
      numero,
      fecha: cobro.fecha,
      monto: cobro.monto,
      metodo_pago: cobro.metodo_pago,
      referencia: cobro.referencia,
    })
    .select()
    .single()

  if (cobroError) {
    console.error("Error creating cobro:", cobroError)
    throw cobroError
  }

  if (cobro.factura_id) {
    const { data: factura } = await supabase
      .from("facturas")
      .select("total, pagado")
      .eq("id", cobro.factura_id)
      .single()

    if (factura) {
      const nuevoPagado = (factura.pagado || 0) + cobro.monto
      const nuevoBalance = factura.total - nuevoPagado
      const nuevoEstado = nuevoBalance <= 0 ? "pagada" : "pendiente"

      await supabase
        .from("facturas")
        .update({
          pagado: nuevoPagado,
          balance: nuevoBalance,
          estado: nuevoEstado,
        })
        .eq("id", cobro.factura_id)
    }
  }

  return cobroData
}

export async function updateCobro(
  id: string,
  updates: Partial<{
    fecha: string
    monto_total: number
    metodo_pago: string
    referencia: string
  }>,
) {
  const { data, error } = await supabase.from("pagos_clientes").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating cobro:", error)
    throw error
  }

  return data
}

export async function deleteCobro(id: string) {
  const { error } = await supabase.from("pagos_clientes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting cobro:", error)
    throw error
  }

  return true
}

export async function getCobrosByCliente(clienteId: string) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching cobros by cliente:", error)
    throw error
  }

  return data || []
}

export async function getCobrosByFecha(fechaInicio: string, fechaFin: string) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select(`
      *,
      clientes (
        nombre
      )
    `)
    .eq("empresa_id", DEFAULT_EMPRESA_ID)
    .gte("fecha", fechaInicio)
    .lte("fecha", fechaFin)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching cobros by fecha:", error)
    throw error
  }

  return data || []
}
