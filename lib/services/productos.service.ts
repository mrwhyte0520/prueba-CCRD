import { supabase } from "@/lib/supabaseClient"

export interface Producto {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  descripcion: string | null
  categoria_id: string | null
  categoria_nombre?: string
  precio_compra: number
  precio_venta: number
  stock: number
  stock_minimo: number
  aplica_itbis: boolean
  activo: boolean
  created_at?: string
  updated_at?: string
}

// Get all productos for the current empresa
export async function getProductos(empresaId: string) {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categorias:categoria_id (
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .order("nombre", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching productos:", error)
    throw error
  }

  return data.map((producto) => ({
    ...producto,
    categoria_nombre: producto.categorias?.nombre,
  }))
}

// Get producto by ID
export async function getProductoById(productoId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categorias:categoria_id (
        nombre
      )
    `)
    .eq("id", productoId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching producto:", error)
    throw error
  }

  return {
    ...data,
    categoria_nombre: data.categorias?.nombre,
  }
}

// Create producto
export async function createProducto(empresaId: string, productoData: Omit<Producto, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("productos")
    .insert({
      empresa_id: empresaId,
      ...productoData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating producto:", error)
    throw error
  }

  return data
}

// Update producto
export async function updateProducto(productoId: string, empresaId: string, productoData: Partial<Producto>) {
  const { data, error } = await supabase
    .from("productos")
    .update(productoData)
    .eq("id", productoId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating producto:", error)
    throw error
  }

  return data
}

// Delete producto (soft delete by marking as inactive)
export async function deleteProducto(productoId: string, empresaId: string) {
  return updateProducto(productoId, empresaId, { activo: false })
}

// Get productos with low stock
export async function getProductosBajoStock(empresaId: string) {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .filter("stock", "lte", "stock_minimo")
    .order("stock", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching productos bajo stock:", error)
    throw error
  }

  return data
}

// TODO: Get empresaId from authenticated user context
export async function getAll() {
  // Using a placeholder empresaId - should be replaced with actual user's empresa_id
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getProductos(empresaId)
}

export async function getAllProductos() {
  return getAll()
}

const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export async function createProductoSimple(productoData: Omit<Producto, "id" | "empresa_id">) {
  return createProducto(PLACEHOLDER_EMPRESA_ID, productoData)
}

export async function deleteProductoSimple(productoId: string) {
  return deleteProducto(productoId, PLACEHOLDER_EMPRESA_ID)
}

export async function updateProductoSimple(productoId: string, productoData: Partial<Producto>) {
  return updateProducto(productoId, PLACEHOLDER_EMPRESA_ID, productoData)
}
