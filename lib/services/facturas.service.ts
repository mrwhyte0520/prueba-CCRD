import { supabase } from "@/lib/supabaseClient"

export interface Factura {
  id: string
  empresa_id: string
  numero: string
  ncf: string | null
  tipo_ncf: string | null
  fecha: string
  cliente_id: string
  cliente_nombre?: string
  subtotal: number
  itbis: number
  descuento: number
  total: number
  estado: "pagada" | "pendiente" | "anulada"
  metodo_pago: string | null
  referencia_pago: string | null
  notas: string | null
  created_at?: string
  updated_at?: string
}

export interface FacturaItem {
  id?: string
  factura_id: string
  producto_id: string
  producto_nombre?: string
  cantidad: number
  precio_unitario: number
  itbis: number
  descuento: number
  total: number
}

export interface CreateFacturaData {
  numero: string
  ncf?: string
  tipo_ncf?: string
  cliente_id: string
  subtotal: number
  itbis: number
  descuento: number
  total: number
  metodo_pago?: string
  referencia_pago?: string
  notas?: string
  items: Omit<FacturaItem, "id" | "factura_id">[]
}

// Get all facturas for the current empresa
export async function getFacturas(empresaId: string) {
  const { data, error } = await supabase
    .from("facturas")
    .select(`
      *,
      clientes:cliente_id (
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching facturas:", error)
    throw error
  }

  return data.map((factura) => ({
    ...factura,
    cliente_nombre: factura.clientes?.nombre,
  }))
}

// Get a single factura by ID
export async function getFacturaById(facturaId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("facturas")
    .select(`
      *,
      clientes:cliente_id (
        nombre,
        rnc,
        telefono
      ),
      facturas_items (
        id,
        producto_id,
        cantidad,
        precio_unitario,
        itbis,
        descuento,
        total,
        productos:producto_id (
          nombre
        )
      )
    `)
    .eq("id", facturaId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching factura:", error)
    throw error
  }

  return {
    ...data,
    cliente_nombre: data.clientes?.nombre,
    items: data.facturas_items?.map((item: any) => ({
      ...item,
      producto_nombre: item.productos?.nombre,
    })),
  }
}

// Create a new factura with items
export async function createFactura(empresaId: string, facturaData: CreateFacturaData) {
  // Start a transaction by creating the factura first
  const { data: factura, error: facturaError } = await supabase
    .from("facturas")
    .insert({
      empresa_id: empresaId,
      numero: facturaData.numero,
      ncf: facturaData.ncf || null,
      tipo_ncf: facturaData.tipo_ncf || null,
      fecha: new Date().toISOString().split("T")[0],
      cliente_id: facturaData.cliente_id,
      subtotal: facturaData.subtotal,
      itbis: facturaData.itbis,
      descuento: facturaData.descuento,
      total: facturaData.total,
      estado: "pendiente",
      metodo_pago: facturaData.metodo_pago || null,
      referencia_pago: facturaData.referencia_pago || null,
      notas: facturaData.notas || null,
    })
    .select()
    .single()

  if (facturaError) {
    console.error("[v0] Error creating factura:", facturaError)
    throw facturaError
  }

  // Insert factura items
  const items = facturaData.items.map((item) => ({
    factura_id: factura.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    itbis: item.itbis,
    descuento: item.descuento,
    total: item.total,
  }))

  const { error: itemsError } = await supabase.from("facturas_items").insert(items)

  if (itemsError) {
    console.error("[v0] Error creating factura items:", itemsError)
    // Rollback: delete the factura if items failed
    await supabase.from("facturas").delete().eq("id", factura.id)
    throw itemsError
  }

  return factura
}

// Update factura status
export async function updateFacturaEstado(
  facturaId: string,
  empresaId: string,
  estado: "pagada" | "pendiente" | "anulada",
) {
  const { data, error } = await supabase
    .from("facturas")
    .update({ estado })
    .eq("id", facturaId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating factura status:", error)
    throw error
  }

  return data
}

// Delete a factura (soft delete by marking as anulada)
export async function deleteFactura(facturaId: string, empresaId: string) {
  return updateFacturaEstado(facturaId, empresaId, "anulada")
}

// Get facturas by date range
export async function getFacturasByDateRange(empresaId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("facturas")
    .select(`
      *,
      clientes:cliente_id (
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching facturas by date range:", error)
    throw error
  }

  return data.map((factura) => ({
    ...factura,
    cliente_nombre: factura.clientes?.nombre,
  }))
}

// Get next factura number
export async function getNextFacturaNumero(empresaId: string): Promise<string> {
  const { data, error } = await supabase
    .from("facturas")
    .select("numero")
    .eq("empresa_id", empresaId)
    .order("numero", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[v0] Error getting next factura number:", error)
    return "FAC-00001"
  }

  if (!data || data.length === 0) {
    return "FAC-00001"
  }

  const lastNumero = data[0].numero
  const match = lastNumero.match(/FAC-(\d+)/)
  if (match) {
    const nextNum = Number.parseInt(match[1]) + 1
    return `FAC-${nextNum.toString().padStart(5, "0")}`
  }

  return "FAC-00001"
}

// TODO: Get empresaId from authenticated user context
export async function getAllFacturas() {
  // Using a placeholder empresaId - should be replaced with actual user's empresa_id
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getFacturas(empresaId)
}
