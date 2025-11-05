import { supabase } from "@/lib/supabaseClient"

export interface CuentaContable {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  tipo: "activo" | "pasivo" | "capital" | "ingreso" | "gasto"
  subtipo: string | null
  naturaleza: "deudora" | "acreedora"
  nivel: number
  cuenta_padre_id: string | null
  acepta_movimiento: boolean
  balance: number
  activa: boolean
  created_at?: string
  updated_at?: string
}

// Get all cuentas contables for the current empresa
export async function getCuentasContables(empresaId: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching cuentas contables:", error)
    throw error
  }

  return data
}

// Get cuenta contable by ID
export async function getCuentaContableById(cuentaId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("*")
    .eq("id", cuentaId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching cuenta contable:", error)
    throw error
  }

  return data
}

// Get cuentas by tipo
export async function getCuentasByTipo(empresaId: string, tipo: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("tipo", tipo)
    .eq("activa", true)
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching cuentas by tipo:", error)
    throw error
  }

  return data
}

// Get cuentas that accept movements (detail accounts)
export async function getCuentasMovimiento(empresaId: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("acepta_movimiento", true)
    .eq("activa", true)
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching cuentas movimiento:", error)
    throw error
  }

  return data
}

// Create cuenta contable
export async function createCuentaContable(empresaId: string, cuentaData: Omit<CuentaContable, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .insert({
      empresa_id: empresaId,
      ...cuentaData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating cuenta contable:", error)
    throw error
  }

  return data
}

// Update cuenta contable
export async function updateCuentaContable(cuentaId: string, empresaId: string, cuentaData: Partial<CuentaContable>) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .update(cuentaData)
    .eq("id", cuentaId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating cuenta contable:", error)
    throw error
  }

  return data
}

// Delete cuenta contable (soft delete)
export async function deleteCuentaContable(cuentaId: string, empresaId: string) {
  return updateCuentaContable(cuentaId, empresaId, { activa: false })
}

// Get cuenta balance
export async function getCuentaBalance(cuentaId: string, empresaId: string): Promise<number> {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("balance")
    .eq("id", cuentaId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching cuenta balance:", error)
    return 0
  }

  return data.balance || 0
}
