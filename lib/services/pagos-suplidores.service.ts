import { supabase } from "@/lib/supabaseClient"

export interface PagoSuplidor {
  id: string
  empresa_id: string
  numero: string
  fecha: string
  suplidor_id: string
  suplidor_nombre?: string
  orden_compra_id: string
  orden_numero?: string
  monto: number
  metodo_pago: string
  referencia: string | null
  notas: string | null
  created_at?: string
}

export interface CreatePagoSuplidorData {
  numero: string
  fecha: string
  suplidor_id: string
  orden_compra_id: string
  monto: number
  metodo_pago: string
  referencia?: string
  notas?: string
}

// Get all pagos a suplidores for the current empresa
export async function getPagosSuplidores(empresaId: string) {
  const { data, error } = await supabase
    .from("pagos_suplidores")
    .select(`
      *,
      suplidores:suplidor_id (
        nombre
      ),
      ordenes_compra:orden_compra_id (
        numero
      )
    `)
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching pagos suplidores:", error)
    throw error
  }

  return data.map((pago) => ({
    ...pago,
    suplidor_nombre: pago.suplidores?.nombre,
    orden_numero: pago.ordenes_compra?.numero,
  }))
}

// Create pago a suplidor
export async function createPagoSuplidor(empresaId: string, pagoData: CreatePagoSuplidorData) {
  const { data, error } = await supabase
    .from("pagos_suplidores")
    .insert({
      empresa_id: empresaId,
      numero: pagoData.numero,
      fecha: pagoData.fecha,
      suplidor_id: pagoData.suplidor_id,
      orden_compra_id: pagoData.orden_compra_id,
      monto: pagoData.monto,
      metodo_pago: pagoData.metodo_pago,
      referencia: pagoData.referencia || null,
      notas: pagoData.notas || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating pago suplidor:", error)
    throw error
  }

  // Update orden balance
  await updateOrdenBalance(pagoData.orden_compra_id, empresaId)

  return data
}

// Update orden balance after payment
async function updateOrdenBalance(ordenId: string, empresaId: string) {
  // Get orden total
  const { data: orden } = await supabase
    .from("ordenes_compra")
    .select("total")
    .eq("id", ordenId)
    .eq("empresa_id", empresaId)
    .single()

  if (!orden) return

  // Get sum of pagos
  const { data: pagos } = await supabase
    .from("pagos_suplidores")
    .select("monto")
    .eq("orden_compra_id", ordenId)
    .eq("empresa_id", empresaId)

  const totalPagado = pagos?.reduce((sum, pago) => sum + (pago.monto || 0), 0) || 0
  const balance = orden.total - totalPagado

  // Update orden estado
  let estado: "recibida" | "parcial" = "recibida"
  if (balance < orden.total && balance > 0) {
    estado = "parcial"
  }

  await supabase.from("ordenes_compra").update({ estado }).eq("id", ordenId).eq("empresa_id", empresaId)
}

// Get next pago number
export async function getNextPagoSuplidorNumero(empresaId: string): Promise<string> {
  const { data, error } = await supabase
    .from("pagos_suplidores")
    .select("numero")
    .eq("empresa_id", empresaId)
    .order("numero", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[v0] Error getting next pago number:", error)
    return "PAG-00001"
  }

  if (!data || data.length === 0) {
    return "PAG-00001"
  }

  const lastNumero = data[0].numero
  const match = lastNumero.match(/PAG-(\d+)/)
  if (match) {
    const nextNum = Number.parseInt(match[1]) + 1
    return `PAG-${nextNum.toString().padStart(5, "0")}`
  }

  return "PAG-00001"
}
