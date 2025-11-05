import { supabase } from "@/lib/supabaseClient"

export interface MantenimientoActivo {
  id: string
  empresa_id: string
  activo_fijo_id: string
  tipo: "preventivo" | "correctivo" | "predictivo"
  fecha: string
  descripcion: string
  costo: number
  proveedor: string | null
  proximo_mantenimiento: string | null
  realizado_por: string | null
  created_at?: string
}

// Get mantenimientos for an asset
export async function getMantenimientosByActivo(empresaId: string, activoId: string) {
  const { data, error } = await supabase
    .from("mantenimientos_activos")
    .select(`
      *,
      activos_fijos:activo_fijo_id (
        codigo,
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .eq("activo_fijo_id", activoId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching mantenimientos:", error)
    throw error
  }

  return data
}

// Create mantenimiento record
export async function createMantenimiento(
  empresaId: string,
  mantenimientoData: Omit<MantenimientoActivo, "id" | "empresa_id">,
) {
  const { data, error } = await supabase
    .from("mantenimientos_activos")
    .insert({
      empresa_id: empresaId,
      ...mantenimientoData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating mantenimiento:", error)
    throw error
  }

  return data
}

// Get upcoming maintenance
export async function getProximosMantenimientos(empresaId: string, dias = 30) {
  const fechaLimite = new Date()
  fechaLimite.setDate(fechaLimite.getDate() + dias)

  const { data, error } = await supabase
    .from("mantenimientos_activos")
    .select(`
      *,
      activos_fijos:activo_fijo_id (
        codigo,
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .not("proximo_mantenimiento", "is", null)
    .lte("proximo_mantenimiento", fechaLimite.toISOString().split("T")[0])
    .order("proximo_mantenimiento", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching proximos mantenimientos:", error)
    throw error
  }

  return data
}
