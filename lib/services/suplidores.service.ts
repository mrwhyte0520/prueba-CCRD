import { supabase } from "@/lib/supabaseClient"

export interface Suplidor {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  rnc: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  persona_contacto: string | null
  terminos_pago: number
  balance: number
  activo: boolean
  created_at?: string
  updated_at?: string
}

// Get all suplidores for the current empresa
export async function getSuplidores(empresaId: string) {
  const { data, error } = await supabase
    .from("suplidores")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nombre", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching suplidores:", error)
    throw error
  }

  return data
}

// Get suplidor by ID
export async function getSuplidorById(suplidorId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("suplidores")
    .select("*")
    .eq("id", suplidorId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching suplidor:", error)
    throw error
  }

  return data
}

// Create suplidor
export async function createSuplidor(empresaId: string, suplidorData: Omit<Suplidor, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("suplidores")
    .insert({
      empresa_id: empresaId,
      ...suplidorData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating suplidor:", error)
    throw error
  }

  return data
}

// Update suplidor
export async function updateSuplidor(suplidorId: string, empresaId: string, suplidorData: Partial<Suplidor>) {
  const { data, error } = await supabase
    .from("suplidores")
    .update(suplidorData)
    .eq("id", suplidorId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating suplidor:", error)
    throw error
  }

  return data
}

// Delete suplidor (soft delete by marking as inactive)
export async function deleteSuplidor(suplidorId: string, empresaId: string) {
  return updateSuplidor(suplidorId, empresaId, { activo: false })
}

// Get suplidor balance (sum of unpaid ordenes de compra)
export async function getSuplidorBalance(suplidorId: string, empresaId: string): Promise<number> {
  const { data, error } = await supabase
    .from("ordenes_compra")
    .select("total")
    .eq("empresa_id", empresaId)
    .eq("suplidor_id", suplidorId)
    .in("estado", ["pendiente", "parcial"])

  if (error) {
    console.error("[v0] Error fetching suplidor balance:", error)
    return 0
  }

  return data.reduce((sum, orden) => sum + (orden.total || 0), 0)
}

// TODO: Get empresaId from authenticated user context
export async function getAll() {
  // Using a placeholder empresaId - should be replaced with actual user's empresa_id
  const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
  return getSuplidores(empresaId)
}

export async function getAllSuplidores() {
  // Using a placeholder empresaId - should be replaced with actual user's empresa_id
  const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
  return getSuplidores(empresaId)
}
