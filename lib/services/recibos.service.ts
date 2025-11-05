import { supabase } from "../supabaseClient"

export async function getRecibos(empresaId: string, tipo?: "ingreso" | "egreso") {
  let query = supabase.from("recibos").select("*").eq("empresa_id", empresaId).order("fecha", { ascending: false })

  if (tipo) {
    query = query.eq("tipo", tipo)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getReciboById(id: string) {
  const { data, error } = await supabase.from("recibos").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function createRecibo(recibo: {
  empresa_id: string
  numero: string
  tipo: "ingreso" | "egreso"
  fecha: string
  beneficiario: string
  concepto: string
  monto: number
  metodo_pago: string
  referencia?: string
  notas?: string
}) {
  const { data, error } = await supabase.from("recibos").insert([recibo]).select().single()

  if (error) throw error
  return data
}

export async function updateRecibo(
  id: string,
  updates: Partial<{
    numero: string
    tipo: "ingreso" | "egreso"
    fecha: string
    beneficiario: string
    concepto: string
    monto: number
    metodo_pago: string
    referencia?: string
    notas?: string
    estado: string
  }>,
) {
  const { data, error } = await supabase.from("recibos").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteRecibo(id: string) {
  const { error } = await supabase.from("recibos").delete().eq("id", id)

  if (error) throw error
}

export async function getNextNumeroRecibo(empresaId: string, tipo: "ingreso" | "egreso") {
  const prefix = tipo === "ingreso" ? "RI" : "RE"
  const year = new Date().getFullYear()

  const { data, error } = await supabase
    .from("recibos")
    .select("numero")
    .eq("empresa_id", empresaId)
    .eq("tipo", tipo)
    .like("numero", `${prefix}-${year}-%`)
    .order("numero", { ascending: false })
    .limit(1)

  if (error) throw error

  if (!data || data.length === 0) {
    return `${prefix}-${year}-001`
  }

  const lastNumber = data[0].numero
  const match = lastNumber.match(/-(\d+)$/)
  if (match) {
    const nextNum = Number.parseInt(match[1]) + 1
    return `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`
  }

  return `${prefix}-${year}-001`
}
