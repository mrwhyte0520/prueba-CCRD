import { supabase } from "@/lib/supabaseClient"

export interface CuentaContable {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  tipo: string // activo, pasivo, capital, ingreso, gasto
  subtipo?: string
  nivel: number
  cuenta_padre_id?: string
  naturaleza: string // deudora, acreedora
  balance: number
  activo: boolean
  created_at?: string
  updated_at?: string
}

export interface AsientoContable {
  id: string
  empresa_id: string
  numero: string
  fecha: string
  tipo: string // diario, ajuste, cierre
  descripcion: string
  referencia?: string
  total_debito: number
  total_credito: number
  estado: string // borrador, publicado, anulado
  usuario_id?: string
  created_at?: string
  updated_at?: string
}

export interface AsientoDetalle {
  id: string
  asiento_id: string
  cuenta_id: string
  descripcion?: string
  debito: number
  credito: number
  created_at?: string
}

// =====================================================
// CUENTAS CONTABLES
// =====================================================

// Get all cuentas for the current empresa
export async function getCuentas(empresaId: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching cuentas:", error)
    throw error
  }

  return data
}

// Get cuenta by ID
export async function getCuentaById(cuentaId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("*")
    .eq("id", cuentaId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching cuenta:", error)
    throw error
  }

  return data
}

// Create cuenta
export async function createCuenta(empresaId: string, cuentaData: Omit<CuentaContable, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .insert({
      empresa_id: empresaId,
      ...cuentaData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating cuenta:", error)
    throw error
  }

  return data
}

// Update cuenta
export async function updateCuenta(cuentaId: string, empresaId: string, cuentaData: Partial<CuentaContable>) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .update(cuentaData)
    .eq("id", cuentaId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating cuenta:", error)
    throw error
  }

  return data
}

// Delete cuenta (soft delete)
export async function deleteCuenta(cuentaId: string, empresaId: string) {
  return updateCuenta(cuentaId, empresaId, { activo: false })
}

// =====================================================
// ASIENTOS CONTABLES
// =====================================================

// Get all asientos for the current empresa
export async function getAsientos(empresaId: string) {
  const { data, error } = await supabase
    .from("asientos_contables")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: false })
    .order("numero", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching asientos:", error)
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
        *,
        cuentas_contables (
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

  return data
}

// Create asiento with details
export async function createAsiento(
  empresaId: string,
  asientoData: Omit<AsientoContable, "id" | "empresa_id">,
  detalles: Omit<AsientoDetalle, "id" | "asiento_id">[],
) {
  // Calculate totals
  const total_debito = detalles.reduce((sum, d) => sum + d.debito, 0)
  const total_credito = detalles.reduce((sum, d) => sum + d.credito, 0)

  // Validate that debits equal credits
  if (Math.abs(total_debito - total_credito) > 0.01) {
    throw new Error("Los débitos deben ser iguales a los créditos")
  }

  // Insert asiento
  const { data: asiento, error: asientoError } = await supabase
    .from("asientos_contables")
    .insert({
      empresa_id: empresaId,
      ...asientoData,
      total_debito,
      total_credito,
    })
    .select()
    .single()

  if (asientoError) {
    console.error("[v0] Error creating asiento:", asientoError)
    throw asientoError
  }

  // Insert details
  const detallesWithAsientoId = detalles.map((d) => ({
    ...d,
    asiento_id: asiento.id,
  }))

  const { error: detallesError } = await supabase.from("asientos_detalle").insert(detallesWithAsientoId)

  if (detallesError) {
    console.error("[v0] Error creating asiento details:", detallesError)
    throw detallesError
  }

  return asiento
}

// Update asiento status
export async function updateAsientoEstado(asientoId: string, empresaId: string, estado: string) {
  const { data, error } = await supabase
    .from("asientos_contables")
    .update({ estado })
    .eq("id", asientoId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating asiento status:", error)
    throw error
  }

  // If publishing, update account balances
  if (estado === "publicado") {
    await updateAccountBalances(asientoId)
  }

  return data
}

// Update account balances based on asiento details
async function updateAccountBalances(asientoId: string) {
  const { data: detalles, error } = await supabase
    .from("asientos_detalle")
    .select("cuenta_id, debito, credito")
    .eq("asiento_id", asientoId)

  if (error) {
    console.error("[v0] Error fetching asiento details:", error)
    return
  }

  // Update each account balance
  for (const detalle of detalles) {
    const { data: cuenta } = await supabase
      .from("cuentas_contables")
      .select("balance, naturaleza")
      .eq("id", detalle.cuenta_id)
      .single()

    if (cuenta) {
      let newBalance = cuenta.balance
      if (cuenta.naturaleza === "deudora") {
        newBalance += detalle.debito - detalle.credito
      } else {
        newBalance += detalle.credito - detalle.debito
      }

      await supabase.from("cuentas_contables").update({ balance: newBalance }).eq("id", detalle.cuenta_id)
    }
  }
}

// Delete asiento
export async function deleteAsiento(asientoId: string, empresaId: string) {
  // First delete details
  await supabase.from("asientos_detalle").delete().eq("asiento_id", asientoId)

  // Then delete asiento
  const { error } = await supabase.from("asientos_contables").delete().eq("id", asientoId).eq("empresa_id", empresaId)

  if (error) {
    console.error("[v0] Error deleting asiento:", error)
    throw error
  }
}

// =====================================================
// REPORTES
// =====================================================

// Get balance general (balance sheet)
export async function getBalanceGeneral(empresaId: string, fecha?: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .in("tipo", ["activo", "pasivo", "capital"])
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching balance general:", error)
    throw error
  }

  return data
}

// Get estado de resultados (income statement)
export async function getEstadoResultados(empresaId: string, fechaInicio: string, fechaFin: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .in("tipo", ["ingreso", "gasto"])
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching estado resultados:", error)
    throw error
  }

  return data
}

// Get mayor general (general ledger) for a specific account
export async function getMayorGeneral(cuentaId: string, empresaId: string, fechaInicio?: string, fechaFin?: string) {
  let query = supabase
    .from("asientos_detalle")
    .select(`
      *,
      asientos_contables!inner (
        numero,
        fecha,
        descripcion,
        estado,
        empresa_id
      )
    `)
    .eq("cuenta_id", cuentaId)
    .eq("asientos_contables.empresa_id", empresaId)
    .eq("asientos_contables.estado", "publicado")
    .order("asientos_contables(fecha)", { ascending: true })

  if (fechaInicio) {
    query = query.gte("asientos_contables.fecha", fechaInicio)
  }

  if (fechaFin) {
    query = query.lte("asientos_contables.fecha", fechaFin)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching mayor general:", error)
    throw error
  }

  return data
}

// =====================================================
// WRAPPER FUNCTIONS (for compatibility)
// =====================================================

// TODO: Get empresaId from authenticated user context
export async function getAllCuentas() {
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getCuentas(empresaId)
}

export async function getAllAsientos() {
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getAsientos(empresaId)
}
