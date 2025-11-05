import { supabase } from "@/lib/supabaseClient"

export interface InventarioMovimiento {
  id: string
  empresa_id: string
  producto_id: string
  producto_nombre?: string
  almacen_id: string
  almacen_nombre?: string
  tipo_movimiento: "entrada" | "salida" | "ajuste"
  cantidad: number
  referencia: string | null
  fecha: string
  created_at?: string
}

// Get all inventory movements for the current empresa
export async function getInventarioMovimientos(empresaId: string) {
  const { data, error } = await supabase
    .from("inventario_movimientos")
    .select(`
      *,
      productos:producto_id (
        nombre
      ),
      almacenes:almacen_id (
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[v0] Error fetching inventario movimientos:", error)
    throw error
  }

  return data.map((mov) => ({
    ...mov,
    producto_nombre: mov.productos?.nombre,
    almacen_nombre: mov.almacenes?.nombre,
  }))
}

// Get inventory movements by producto
export async function getMovimientosByProducto(empresaId: string, productoId: string) {
  const { data, error } = await supabase
    .from("inventario_movimientos")
    .select(`
      *,
      almacenes:almacen_id (
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .eq("producto_id", productoId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching movimientos by producto:", error)
    throw error
  }

  return data.map((mov) => ({
    ...mov,
    almacen_nombre: mov.almacenes?.nombre,
  }))
}

// Create inventory movement
export async function createInventarioMovimiento(
  empresaId: string,
  movimientoData: Omit<InventarioMovimiento, "id" | "empresa_id">,
) {
  const { data, error } = await supabase
    .from("inventario_movimientos")
    .insert({
      empresa_id: empresaId,
      ...movimientoData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating inventario movimiento:", error)
    throw error
  }

  return data
}
