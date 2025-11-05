import { supabase } from "@/lib/supabaseClient"

export interface SerieNCF {
  id: string
  empresa_id: string
  tipo_comprobante: "B01" | "B02" | "B14" | "B15" | "B16"
  secuencia_desde: number
  secuencia_hasta: number
  secuencia_actual: number
  fecha_vencimiento: string
  activa: boolean
  created_at?: string
}

// Get series NCF
export async function getSeriesNCF(empresaId: string) {
  const { data, error } = await supabase
    .from("series_ncf")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("tipo_comprobante", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching series NCF:", error)
    throw error
  }

  return data
}

// Create serie NCF
export async function createSerieNCF(empresaId: string, serieData: Omit<SerieNCF, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("series_ncf")
    .insert({
      empresa_id: empresaId,
      ...serieData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating serie NCF:", error)
    throw error
  }

  return data
}

// Get next NCF for a tipo_comprobante
export async function getNextNCF(empresaId: string, tipoComprobante: string): Promise<string> {
  const { data, error } = await supabase
    .from("series_ncf")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("tipo_comprobante", tipoComprobante)
    .eq("activa", true)
    .single()

  if (error || !data) {
    throw new Error(`No hay serie activa para el tipo de comprobante ${tipoComprobante}`)
  }

  if (data.secuencia_actual >= data.secuencia_hasta) {
    throw new Error(`La serie de NCF ${tipoComprobante} está agotada`)
  }

  const nextSecuencia = data.secuencia_actual + 1
  const ncf = `${tipoComprobante}${nextSecuencia.toString().padStart(8, "0")}`

  // Update secuencia_actual
  await supabase
    .from("series_ncf")
    .update({ secuencia_actual: nextSecuencia })
    .eq("id", data.id)
    .eq("empresa_id", empresaId)

  return ncf
}

// Check if NCF is valid
export async function validarNCF(empresaId: string, ncf: string): Promise<boolean> {
  const tipoComprobante = ncf.substring(0, 3)
  const secuencia = Number.parseInt(ncf.substring(3))

  const { data, error } = await supabase
    .from("series_ncf")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("tipo_comprobante", tipoComprobante)
    .eq("activa", true)
    .single()

  if (error || !data) {
    return false
  }

  return secuencia >= data.secuencia_desde && secuencia <= data.secuencia_hasta
}
