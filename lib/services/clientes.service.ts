import { supabase } from "@/lib/supabaseClient"

export interface Cliente {
  id: string
  empresa_id: string
  nombre: string
  rnc: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  limite_credito: number
  balance: number
  activo: boolean
  created_at?: string
  updated_at?: string
}

// Get all clientes for the current empresa
export async function getClientes(empresaId: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nombre", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching clientes:", error)
    throw error
  }

  return data
}

// Get cliente by ID
export async function getClienteById(clienteId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", clienteId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) {
    console.error("[v0] Error fetching cliente:", error)
    throw error
  }

  return data
}

// Create cliente
export async function createCliente(empresaId: string, clienteData: Omit<Cliente, "id" | "empresa_id">) {
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      empresa_id: empresaId,
      ...clienteData,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating cliente:", error)
    throw error
  }

  return data
}

// Update cliente
export async function updateCliente(clienteId: string, empresaId: string, clienteData: Partial<Cliente>) {
  const { data, error } = await supabase
    .from("clientes")
    .update(clienteData)
    .eq("id", clienteId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating cliente:", error)
    throw error
  }

  return data
}

// Delete cliente (soft delete by marking as inactive)
export async function deleteCliente(clienteId: string, empresaId: string) {
  return updateCliente(clienteId, empresaId, { activo: false })
}

// Get cliente balance (sum of unpaid facturas)
export async function getClienteBalance(clienteId: string, empresaId: string): Promise<number> {
  const { data, error } = await supabase
    .from("facturas")
    .select("total")
    .eq("empresa_id", empresaId)
    .eq("cliente_id", clienteId)
    .in("estado", ["pendiente", "parcial"])

  if (error) {
    console.error("[v0] Error fetching cliente balance:", error)
    return 0
  }

  return data.reduce((sum, factura) => sum + (factura.total || 0), 0)
}

// TODO: Get empresaId from authenticated user context
export async function getAllClientes() {
  // Using a placeholder empresaId - should be replaced with actual user's empresa_id
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getClientes(empresaId)
}
