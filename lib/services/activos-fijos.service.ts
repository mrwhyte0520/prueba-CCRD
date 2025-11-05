import { supabase } from "@/lib/supabaseClient"

export interface ActivoFijo {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  descripcion: string | null
  categoria: string
  fecha_adquisicion: string
  costo_adquisicion: number
  vida_util_anos: number
  valor_residual: number
  metodo_depreciacion: "lineal" | "acelerada" | "unidades_produccion"
  ubicacion: string | null
  responsable: string | null
  estado: "activo" | "en_mantenimiento" | "dado_de_baja" | "vendido"
  valor_libro: number
  depreciacion_acumulada: number
  created_at?: string
  updated_at?: string
}

// Get all activos fijos for the current empresa
export async function getActivosFijos(empresaId: string) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching activos fijos:", error)
    throw error
  }

  return data
}

// Get activo fijo by ID
export async function getActivoFijoById(activoId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .select("*")
    .eq("id", activoId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching activo fijo:", error)
    throw error
  }

  return data
}

// Create activo fijo
export async function createActivoFijo(empresaId: string, activoData: Omit<ActivoFijo, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .insert({
      empresa_id: empresaId,
      ...activoData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating activo fijo:", error)
    throw error
  }

  return data
}

// Update activo fijo
export async function updateActivoFijo(activoId: string, empresaId: string, activoData: Partial<ActivoFijo>) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .update(activoData)
    .eq("id", activoId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating activo fijo:", error)
    throw error
  }

  return data
}

// Calculate depreciation for an asset
export function calcularDepreciacion(activo: ActivoFijo, meses: number): number {
  const costoDepreciable = activo.costo_adquisicion - activo.valor_residual
  const vidaUtilMeses = activo.vida_util_anos * 12

  if (activo.metodo_depreciacion === "lineal") {
    const depreciacionMensual = costoDepreciable / vidaUtilMeses
    return depreciacionMensual * meses
  }

  // For other methods, implement specific logic
  return 0
}

// Get activos by categoria
export async function getActivosByCategoria(empresaId: string, categoria: string) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("categoria", categoria)
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching activos by categoria:", error)
    throw error
  }

  return data
}

export async function getActivos(empresaId: string) {
  return getActivosFijos(empresaId)
}

// TODO: Get empresaId from authenticated user context
export async function getAll() {
  // Using a placeholder empresaId - should be replaced with actual user's empresa_id
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getActivosFijos(empresaId)
}
