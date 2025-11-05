import { supabase } from "@/lib/supabaseClient"

export interface DepreciacionRegistro {
  id: string
  empresa_id: string
  activo_id: string
  periodo: string
  monto: number
  asiento_id: string | null
  created_at?: string
}

// Get depreciacion records for an asset
export async function getDepreciacionByActivo(empresaId: string, activoId: string) {
  const { data, error } = await supabase
    .from("depreciaciones")
    .select(`
      *,
      activos_fijos:activo_id (
        codigo,
        nombre
      )
    `)
    .eq("activo_id", activoId)
    .order("periodo", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching depreciacion:", error)
    throw error
  }

  return data
}

// Create depreciacion record
export async function createDepreciacionRegistro(depreciacionData: Omit<DepreciacionRegistro, "id" | "created_at">) {
  const { data, error } = await supabase.from("depreciaciones").insert(depreciacionData).select().single()

  if (error) {
    console.error("[v0] Error creating depreciacion registro:", error)
    throw error
  }

  return data
}

// Calculate monthly depreciation for all assets
export async function calcularDepreciacionMensual(empresaId: string, periodo: string) {
  const { data: activos, error } = await supabase
    .from("activos_fijos")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("estado", "activo")

  if (error) {
    console.error("[v0] Error fetching activos for depreciation:", error)
    throw error
  }

  const registros = []

  for (const activo of activos) {
    const costoDepreciable = activo.costo_adquisicion - activo.valor_residual
    const vidaUtilMeses = activo.vida_util_anos * 12
    const depreciacionMensual = costoDepreciable / vidaUtilMeses

    registros.push({
      activo_id: activo.id,
      periodo,
      monto: depreciacionMensual,
      asiento_id: null,
    })
  }

  return registros
}

// Get depreciaciones records for a specific year
export async function getDepreciacionesByYear(empresaId: string, year: number) {
  const startPeriod = `${year}-01`
  const endPeriod = `${year}-12`

  const { data, error } = await supabase
    .from("depreciaciones")
    .select(`
      *,
      activos_fijos:activo_id (
        codigo,
        nombre,
        categoria,
        empresa_id
      )
    `)
    .gte("periodo", startPeriod)
    .lte("periodo", endPeriod)
    .order("periodo", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching depreciaciones by year:", error)
    throw error
  }

  // Filter by empresa_id through the activos_fijos relationship
  return data.filter((d: any) => d.activos_fijos?.empresa_id === empresaId)
}
