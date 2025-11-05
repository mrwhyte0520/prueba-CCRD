import { supabase } from "@/lib/supabaseClient"

export interface OrdenCompra {
  id: string
  empresa_id: string
  numero: string
  fecha: string
  suplidor_id: string
  suplidor_nombre?: string
  subtotal: number
  itbis: number
  total: number
  estado: "pendiente" | "aprobada" | "recibida" | "anulada"
  observaciones: string | null
  created_at?: string
  updated_at?: string
}

export interface OrdenCompraItem {
  id?: string
  orden_compra_id: string
  producto_id: string
  producto_nombre?: string
  cantidad: number
  precio_unitario: number
  total: number
}

export interface CreateOrdenCompraData {
  numero: string
  fecha: string
  suplidor_id: string
  subtotal: number
  itbis: number
  total: number
  observaciones?: string
  items: Omit<OrdenCompraItem, "id" | "orden_compra_id">[]
}

// Get all ordenes de compra for the current empresa
export async function getOrdenesCompra(empresaId: string) {
  const { data, error } = await supabase
    .from("ordenes_compra")
    .select(`
      *,
      suplidores:suplidor_id (
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching ordenes de compra:", error)
    throw error
  }

  return data.map((orden) => ({
    ...orden,
    suplidor_nombre: orden.suplidores?.nombre,
  }))
}

// Get orden de compra by ID with items
export async function getOrdenCompraById(ordenId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("ordenes_compra")
    .select(`
      *,
      suplidores:suplidor_id (
        nombre,
        rnc,
        telefono
      ),
      ordenes_compra_items (
        id,
        producto_id,
        cantidad,
        precio_unitario,
        total,
        productos:producto_id (
          nombre
        )
      )
    `)
    .eq("id", ordenId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching orden de compra:", error)
    throw error
  }

  return {
    ...data,
    suplidor_nombre: data.suplidores?.nombre,
    items: data.ordenes_compra_items?.map((item: any) => ({
      ...item,
      producto_nombre: item.productos?.nombre,
    })),
  }
}

// Create orden de compra with items
export async function createOrdenCompra(empresaId: string, ordenData: CreateOrdenCompraData) {
  // Create the orden
  const { data: orden, error: ordenError } = await supabase
    .from("ordenes_compra")
    .insert({
      empresa_id: empresaId,
      numero: ordenData.numero,
      fecha: ordenData.fecha,
      suplidor_id: ordenData.suplidor_id,
      subtotal: ordenData.subtotal,
      itbis: ordenData.itbis,
      total: ordenData.total,
      estado: "pendiente",
      observaciones: ordenData.observaciones || null,
    })
    .select()
    .single()

  if (ordenError) {
    console.error("[v0] Error creating orden de compra:", ordenError)
    throw ordenError
  }

  // Insert orden items
  const items = ordenData.items.map((item) => ({
    orden_compra_id: orden.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    total: item.total,
  }))

  const { error: itemsError } = await supabase.from("ordenes_compra_items").insert(items)

  if (itemsError) {
    console.error("[v0] Error creating orden items:", itemsError)
    // Rollback: delete the orden if items failed
    await supabase.from("ordenes_compra").delete().eq("id", orden.id)
    throw itemsError
  }

  return orden
}

// Update orden de compra status
export async function updateOrdenCompraEstado(
  ordenId: string,
  empresaId: string,
  estado: "pendiente" | "aprobada" | "recibida" | "anulada",
) {
  const { data, error } = await supabase
    .from("ordenes_compra")
    .update({ estado })
    .eq("id", ordenId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating orden status:", error)
    throw error
  }

  return data
}

// Receive orden de compra (mark as recibida and update inventory)
export async function recibirOrdenCompra(ordenId: string, empresaId: string, almacenId: string) {
  // Get orden with items
  const orden = await getOrdenCompraById(ordenId, empresaId)

  if (orden.estado !== "aprobada") {
    throw new Error("Solo se pueden recibir órdenes aprobadas")
  }

  // Update orden status
  await updateOrdenCompraEstado(ordenId, empresaId, "recibida")

  // Create inventory movements for each item
  const movimientos = orden.items?.map((item: any) => ({
    empresa_id: empresaId,
    producto_id: item.producto_id,
    almacen_id: almacenId,
    tipo_movimiento: "entrada",
    cantidad: item.cantidad,
    referencia: `Orden de Compra ${orden.numero}`,
    fecha: new Date().toISOString().split("T")[0],
  }))

  if (movimientos && movimientos.length > 0) {
    const { error: movError } = await supabase.from("inventario_movimientos").insert(movimientos)

    if (movError) {
      console.error("[v0] Error creating inventory movements:", movError)
      throw movError
    }
  }

  return orden
}

// Get next orden de compra number
export async function getNextOrdenCompraNumero(empresaId: string): Promise<string> {
  const { data, error } = await supabase
    .from("ordenes_compra")
    .select("numero")
    .eq("empresa_id", empresaId)
    .order("numero", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[v0] Error getting next orden number:", error)
    return "OC-00001"
  }

  if (!data || data.length === 0) {
    return "OC-00001"
  }

  const lastNumero = data[0].numero
  const match = lastNumero.match(/OC-(\d+)/)
  if (match) {
    const nextNum = Number.parseInt(match[1]) + 1
    return `OC-${nextNum.toString().padStart(5, "0")}`
  }

  return "OC-00001"
}

// TODO: Get empresaId from authenticated user context
export async function getAll() {
  // Using a placeholder empresaId - should be replaced with actual user's empresa_id
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getOrdenesCompra(empresaId)
}
