import { supabase } from "@/lib/supabaseClient"

export interface Almacen {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  direccion: string | null
  responsable: string | null
  activo: boolean
  created_at?: string
  updated_at?: string
}

// Get all almacenes for the current empresa
export async function getAlmacenes(empresaId: string) {
  const { data, error } = await supabase
    .from("almacenes")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nombre", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching almacenes:", error)
    throw error
  }

  return data
}

// Get almacen by ID
export async function getAlmacenById(almacenId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("almacenes")
    .select("*")
    .eq("id", almacenId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching almacen:", error)
    throw error
  }

  return data
}

// Create almacen
export async function createAlmacen(empresaId: string, almacenData: Omit<Almacen, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("almacenes")
    .insert({
      empresa_id: empresaId,
      ...almacenData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating almacen:", error)
    throw error
  }

  return data
}

// Update almacen
export async function updateAlmacen(almacenId: string, empresaId: string, almacenData: Partial<Almacen>) {
  const { data, error } = await supabase
    .from("almacenes")
    .update(almacenData)
    .eq("id", almacenId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating almacen:", error)
    throw error
  }

  return data
}

// Delete almacen (soft delete by marking as inactive)
export async function deleteAlmacen(almacenId: string, empresaId: string) {
  return updateAlmacen(almacenId, empresaId, { activo: false })
}

export async function getAllAlmacenes() {
  const DEFAULT_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
  return getAlmacenes(DEFAULT_EMPRESA_ID)
}
