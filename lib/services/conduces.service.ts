import { supabase } from "@/lib/supabaseClient"

export interface Conduce {
  id: string
  empresa_id: string
  numero: string
  fecha: string
  almacen_origen_id: string
  almacen_destino_id: string
  almacen_origen_nombre?: string
  almacen_destino_nombre?: string
  estado: "pendiente" | "completado" | "anulado"
  notas: string | null
  created_at?: string
  updated_at?: string
}

export interface ConduceItem {
  id?: string
  conduce_id: string
  producto_id: string
  producto_nombre?: string
  cantidad: number
}

export interface CreateConduceData {
  numero: string
  fecha: string
  almacen_origen_id: string
  almacen_destino_id: string
  notas?: string
  items: Omit<ConduceItem, "id" | "conduce_id">[]
}

// Get all conduces for the current empresa
export async function getConduces(empresaId: string) {
  const { data, error } = await supabase
    .from("conduces")
    .select(`
      *,
      almacen_origen:almacen_origen_id (
        nombre
      ),
      almacen_destino:almacen_destino_id (
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching conduces:", error)
    throw error
  }

  return data.map((conduce) => ({
    ...conduce,
    almacen_origen_nombre: conduce.almacen_origen?.nombre,
    almacen_destino_nombre: conduce.almacen_destino?.nombre,
  }))
}

// Get conduce by ID with items
export async function getConduceById(conduceId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("conduces")
    .select(`
      *,
      almacen_origen:almacen_origen_id (
        nombre
      ),
      almacen_destino:almacen_destino_id (
        nombre
      ),
      conduces_items (
        id,
        producto_id,
        cantidad,
        productos:producto_id (
          nombre
        )
      )
    `)
    .eq("id", conduceId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching conduce:", error)
    throw error
  }

  return {
    ...data,
    almacen_origen_nombre: data.almacen_origen?.nombre,
    almacen_destino_nombre: data.almacen_destino?.nombre,
    items: data.conduces_items?.map((item: any) => ({
      ...item,
      producto_nombre: item.productos?.nombre,
    })),
  }
}

// Create conduce with items
export async function createConduce(empresaId: string, conduceData: CreateConduceData) {
  // Create the conduce
  const { data: conduce, error: conduceError } = await supabase
    .from("conduces")
    .insert({
      empresa_id: empresaId,
      numero: conduceData.numero,
      fecha: conduceData.fecha,
      almacen_origen_id: conduceData.almacen_origen_id,
      almacen_destino_id: conduceData.almacen_destino_id,
      estado: "pendiente",
      notas: conduceData.notas || null,
    })
    .select()
    .single()

  if (conduceError) {
    console.error("[v0] Error creating conduce:", conduceError)
    throw conduceError
  }

  // Insert conduce items
  const items = conduceData.items.map((item) => ({
    conduce_id: conduce.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
  }))

  const { error: itemsError } = await supabase.from("conduces_items").insert(items)

  if (itemsError) {
    console.error("[v0] Error creating conduce items:", itemsError)
    // Rollback: delete the conduce if items failed
    await supabase.from("conduces").delete().eq("id", conduce.id)
    throw itemsError
  }

  return conduce
}

// Update conduce status
export async function updateConduceEstado(
  conduceId: string,
  empresaId: string,
  estado: "pendiente" | "completado" | "anulado",
) {
  const { data, error } = await supabase
    .from("conduces")
    .update({ estado })
    .eq("id", conduceId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating conduce status:", error)
    throw error
  }

  return data
}

// Complete conduce (mark as completado and create inventory movements)
export async function completarConduce(conduceId: string, empresaId: string) {
  // Get conduce with items
  const conduce = await getConduceById(conduceId, empresaId)

  if (conduce.estado !== "pendiente") {
    throw new Error("Solo se pueden completar conduces pendientes")
  }

  // Update conduce status
  await updateConduceEstado(conduceId, empresaId, "completado")

  // Create inventory movements for each item
  const movimientos = conduce.items?.flatMap((item: any) => [
    // Salida del almacén origen
    {
      empresa_id: empresaId,
      producto_id: item.producto_id,
      almacen_id: conduce.almacen_origen_id,
      tipo_movimiento: "salida",
      cantidad: item.cantidad,
      referencia: `Conduce ${conduce.numero}`,
      fecha: new Date().toISOString().split("T")[0],
    },
    // Entrada al almacén destino
    {
      empresa_id: empresaId,
      producto_id: item.producto_id,
      almacen_id: conduce.almacen_destino_id,
      tipo_movimiento: "entrada",
      cantidad: item.cantidad,
      referencia: `Conduce ${conduce.numero}`,
      fecha: new Date().toISOString().split("T")[0],
    },
  ])

  if (movimientos && movimientos.length > 0) {
    const { error: movError } = await supabase.from("inventario_movimientos").insert(movimientos)

    if (movError) {
      console.error("[v0] Error creating inventory movements:", movError)
      throw movError
    }
  }

  return conduce
}

// Get next conduce number
export async function getNextConduceNumero(empresaId: string): Promise<string> {
  const { data, error } = await supabase
    .from("conduces")
    .select("numero")
    .eq("empresa_id", empresaId)
    .order("numero", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[v0] Error getting next conduce number:", error)
    return "CON-00001"
  }

  if (!data || data.length === 0) {
    return "CON-00001"
  }

  const lastNumero = data[0].numero
  const match = lastNumero.match(/CON-(\d+)/)
  if (match) {
    const nextNum = Number.parseInt(match[1]) + 1
    return `CON-${nextNum.toString().padStart(5, "0")}`
  }

  return "CON-00001"
}

export async function getAllConduces() {
  const DEFAULT_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"
  return getConduces(DEFAULT_EMPRESA_ID)
}
