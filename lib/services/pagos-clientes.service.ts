import { supabase } from "@/lib/supabaseClient"

export interface PagoCliente {
  id: string
  empresa_id: string
  numero: string
  fecha: string
  cliente_id: string
  cliente_nombre?: string
  factura_id: string
  factura_numero?: string
  monto: number
  metodo_pago: string
  referencia: string | null
  notas: string | null
  created_at?: string
}

export interface CreatePagoClienteData {
  numero: string
  fecha: string
  cliente_id: string
  factura_id: string
  monto: number
  metodo_pago: string
  referencia?: string
  notas?: string
}

// Get all pagos de clientes for the current empresa
export async function getPagosClientes(empresaId: string) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select(`
      *,
      clientes:cliente_id (
        nombre
      ),
      facturas:factura_id (
        numero
      )
    `)
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching pagos clientes:", error)
    throw error
  }

  return data.map((pago) => ({
    ...pago,
    cliente_nombre: pago.clientes?.nombre,
    factura_numero: pago.facturas?.numero,
  }))
}

// Get pago by ID
export async function getPagoClienteById(pagoId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select(`
      *,
      clientes:cliente_id (
        nombre
      ),
      facturas:factura_id (
        numero
      )
    `)
    .eq("id", pagoId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching pago cliente:", error)
    throw error
  }

  return {
    ...data,
    cliente_nombre: data.clientes?.nombre,
    factura_numero: data.facturas?.numero,
  }
}

// Create pago de cliente
export async function createPagoCliente(empresaId: string, pagoData: CreatePagoClienteData) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .insert({
      empresa_id: empresaId,
      numero: pagoData.numero,
      fecha: pagoData.fecha,
      cliente_id: pagoData.cliente_id,
      factura_id: pagoData.factura_id,
      monto: pagoData.monto,
      metodo_pago: pagoData.metodo_pago,
      referencia: pagoData.referencia || null,
      notas: pagoData.notas || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating pago cliente:", error)
    throw error
  }

  // Update factura balance
  await updateFacturaBalance(pagoData.factura_id, empresaId)

  return data
}

// Update factura balance after payment
async function updateFacturaBalance(facturaId: string, empresaId: string) {
  // Get factura total
  const { data: factura } = await supabase
    .from("facturas")
    .select("total")
    .eq("id", facturaId)
    .eq("empresa_id", empresaId)
    .single()

  if (!factura) return

  // Get sum of pagos
  const { data: pagos } = await supabase
    .from("pagos_clientes")
    .select("monto")
    .eq("factura_id", facturaId)
    .eq("empresa_id", empresaId)

  const totalPagado = pagos?.reduce((sum, pago) => sum + (pago.monto || 0), 0) || 0
  const balance = factura.total - totalPagado

  // Update factura estado
  let estado: "pagada" | "pendiente" | "parcial" = "pendiente"
  if (balance === 0) {
    estado = "pagada"
  } else if (balance < factura.total) {
    estado = "parcial"
  }

  await supabase.from("facturas").update({ estado }).eq("id", facturaId).eq("empresa_id", empresaId)
}

// Get pagos by cliente
export async function getPagosByCliente(empresaId: string, clienteId: string) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select(`
      *,
      facturas:factura_id (
        numero
      )
    `)
    .eq("empresa_id", empresaId)
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching pagos by cliente:", error)
    throw error
  }

  return data.map((pago) => ({
    ...pago,
    factura_numero: pago.facturas?.numero,
  }))
}

// Get pagos by date range
export async function getPagosByDateRange(empresaId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select(`
      *,
      clientes:cliente_id (
        nombre
      ),
      facturas:factura_id (
        numero
      )
    `)
    .eq("empresa_id", empresaId)
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching pagos by date range:", error)
    throw error
  }

  return data.map((pago) => ({
    ...pago,
    cliente_nombre: pago.clientes?.nombre,
    factura_numero: pago.facturas?.numero,
  }))
}

// Get next pago number
export async function getNextPagoNumero(empresaId: string): Promise<string> {
  const { data, error } = await supabase
    .from("pagos_clientes")
    .select("numero")
    .eq("empresa_id", empresaId)
    .order("numero", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[v0] Error getting next pago number:", error)
    return "COB-00001"
  }

  if (!data || data.length === 0) {
    return "COB-00001"
  }

  const lastNumero = data[0].numero
  const match = lastNumero.match(/COB-(\d+)/)
  if (match) {
    const nextNum = Number.parseInt(match[1]) + 1
    return `COB-${nextNum.toString().padStart(5, "0")}`
  }

  return "COB-00001"
}
