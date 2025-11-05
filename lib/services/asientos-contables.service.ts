import { supabase } from "@/lib/supabaseClient"

export interface AsientoContable {
  id: string
  empresa_id: string
  numero: string
  fecha: string
  tipo: "diario" | "ajuste" | "cierre" | "apertura"
  descripcion: string
  referencia: string | null
  estado: "borrador" | "publicado" | "anulado"
  created_at?: string
  updated_at?: string
}

export interface AsientoDetalle {
  id?: string
  asiento_id: string
  cuenta_id: string
  cuenta_codigo?: string
  cuenta_nombre?: string
  debe: number
  haber: number
  descripcion: string | null
}

export interface CreateAsientoData {
  numero: string
  fecha: string
  tipo: "diario" | "ajuste" | "cierre" | "apertura"
  descripcion: string
  referencia?: string
  detalles: Omit<AsientoDetalle, "id" | "asiento_id">[]
}

// Get all asientos contables for the current empresa
export async function getAsientosContables(empresaId: string) {
  const { data, error } = await supabase
    .from("asientos_contables")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching asientos contables:", error)
    throw error
  }

  return data
}

// Get asiento by ID with details
export async function getAsientoById(asientoId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("asientos_contables")
    .select(`
      *,
      asientos_detalle (
        id,
        cuenta_id,
        debe,
        haber,
        descripcion,
        cuentas_contables:cuenta_id (
          codigo,
          nombre
        )
      )
    `)
    .eq("id", asientoId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching asiento:", error)
    throw error
  }

  return {
    ...data,
    detalles: data.asientos_detalle?.map((detalle: any) => ({
      ...detalle,
      cuenta_codigo: detalle.cuentas_contables?.codigo,
      cuenta_nombre: detalle.cuentas_contables?.nombre,
    })),
  }
}

// Create asiento contable with details
export async function createAsientoContable(empresaId: string, asientoData: CreateAsientoData) {
  // Validate that debe = haber
  const totalDebe = asientoData.detalles.reduce((sum, d) => sum + d.debe, 0)
  const totalHaber = asientoData.detalles.reduce((sum, d) => sum + d.haber, 0)

  if (Math.abs(totalDebe - totalHaber) > 0.01) {
    throw new Error("El asiento no está balanceado. Debe = Haber")
  }

  // Create the asiento
  const { data: asiento, error: asientoError } = await supabase
    .from("asientos_contables")
    .insert({
      empresa_id: empresaId,
      numero: asientoData.numero,
      fecha: asientoData.fecha,
      tipo: asientoData.tipo,
      descripcion: asientoData.descripcion,
      referencia: asientoData.referencia || null,
      estado: "borrador",
    })
    .select()
    .single()

  if (asientoError) {
    console.error("[v0] Error creating asiento:", asientoError)
    throw asientoError
  }

  // Insert asiento details
  const detalles = asientoData.detalles.map((detalle) => ({
    asiento_id: asiento.id,
    cuenta_id: detalle.cuenta_id,
    debe: detalle.debe,
    haber: detalle.haber,
    descripcion: detalle.descripcion || null,
  }))

  const { error: detallesError } = await supabase.from("asientos_detalle").insert(detalles)

  if (detallesError) {
    console.error("[v0] Error creating asiento details:", detallesError)
    // Rollback: delete the asiento if details failed
    await supabase.from("asientos_contables").delete().eq("id", asiento.id)
    throw detallesError
  }

  return asiento
}

// Publish asiento (update account balances)
export async function publicarAsiento(asientoId: string, empresaId: string) {
  const asiento = await getAsientoById(asientoId, empresaId)

  if (asiento.estado !== "borrador") {
    throw new Error("Solo se pueden publicar asientos en borrador")
  }

  // Update account balances
  for (const detalle of asiento.detalles || []) {
    const cuenta = await supabase
      .from("cuentas_contables")
      .select("balance, naturaleza")
      .eq("id", detalle.cuenta_id)
      .eq("empresa_id", empresaId)
      .single()

    if (cuenta.data) {
      let nuevoBalance = cuenta.data.balance

      if (cuenta.data.naturaleza === "deudora") {
        nuevoBalance += detalle.debe - detalle.haber
      } else {
        nuevoBalance += detalle.haber - detalle.debe
      }

      await supabase
        .from("cuentas_contables")
        .update({ balance: nuevoBalance })
        .eq("id", detalle.cuenta_id)
        .eq("empresa_id", empresaId)
    }
  }

  // Update asiento status
  const { data, error } = await supabase
    .from("asientos_contables")
    .update({ estado: "publicado" })
    .eq("id", asientoId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error publishing asiento:", error)
    throw error
  }

  return data
}

// Anular asiento
export async function anularAsiento(asientoId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("asientos_contables")
    .update({ estado: "anulado" })
    .eq("id", asientoId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error anulando asiento:", error)
    throw error
  }

  return data
}

// Get next asiento number
export async function getNextAsientoNumero(empresaId: string): Promise<string> {
  const { data, error } = await supabase
    .from("asientos_contables")
    .select("numero")
    .eq("empresa_id", empresaId)
    .order("numero", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[v0] Error getting next asiento number:", error)
    return "ASI-00001"
  }

  if (!data || data.length === 0) {
    return "ASI-00001"
  }

  const lastNumero = data[0].numero
  const match = lastNumero.match(/ASI-(\d+)/)
  if (match) {
    const nextNum = Number.parseInt(match[1]) + 1
    return `ASI-${nextNum.toString().padStart(5, "0")}`
  }

  return "ASI-00001"
}
