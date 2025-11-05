import { supabase } from "@/lib/supabaseClient"

export interface Categoria {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  descripcion: string | null
  activo: boolean
  created_at?: string
  updated_at?: string
}

// Get all categorias for the current empresa
export async function getCategorias(empresaId: string) {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nombre", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching categorias:", error)
    throw error
  }

  return data
}

// Get categoria by ID
export async function getCategoriaById(categoriaId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("id", categoriaId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching categoria:", error)
    throw error
  }

  return data
}

// Create categoria
export async function createCategoria(empresaId: string, categoriaData: Omit<Categoria, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("categorias")
    .insert({
      empresa_id: empresaId,
      ...categoriaData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating categoria:", error)
    throw error
  }

  return data
}

// Update categoria
export async function updateCategoria(categoriaId: string, empresaId: string, categoriaData: Partial<Categoria>) {
  const { data, error } = await supabase
    .from("categorias")
    .update(categoriaData)
    .eq("id", categoriaId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating categoria:", error)
    throw error
  }

  return data
}

// Delete categoria (soft delete by marking as inactive)
export async function deleteCategoria(categoriaId: string, empresaId: string) {
  return updateCategoria(categoriaId, empresaId, { activo: false })
}

// TODO: Replace with actual empresaId from authenticated user
const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export async function getAllCategorias() {
  return getCategorias(PLACEHOLDER_EMPRESA_ID)
}
