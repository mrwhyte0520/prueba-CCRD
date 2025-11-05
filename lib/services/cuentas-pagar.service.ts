import { supabase } from "@/lib/supabaseClient"

export interface CuentaPorPagar {
  id: string
  orden_numero: string
  suplidor_id: string
  suplidor_nombre?: string
  fecha: string
  vencimiento: string
  monto: number
  balance: number
  estado: "pendiente" | "parcial" | "vencida" | "pagada"
  dias_vencido: number
}

// Get all cuentas por pagar for the current empresa
export async function getCuentasPorPagar(empresaId: string) {
  const { data, error } = await supabase
    .from("ordenes_compra")
    .select(`
      id,
      numero,
      fecha,
      total,
      estado,
      suplidores:suplidor_id (
        id,
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .in("estado", ["aprobada", "recibida", "parcial"])
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching cuentas por pagar:", error)
    throw error
  }

  // Calculate balance and days overdue for each orden
  const cuentas = await Promise.all(
    data.map(async (orden) => {
      const balance = await getOrdenBalance(orden.id, empresaId)
      const terminosPago = 30
      const vencimiento = new Date(orden.fecha)
      vencimiento.setDate(vencimiento.getDate() + terminosPago)

      const hoy = new Date()
      const diasVencido = Math.max(0, Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24)))

      let estado: "pendiente" | "parcial" | "vencida" | "pagada" = "pendiente"
      if (balance === 0) {
        estado = "pagada"
      } else if (balance < orden.total) {
        estado = "parcial"
      } else if (diasVencido > 0) {
        estado = "vencida"
      }

      return {
        id: orden.id,
        orden_numero: orden.numero,
        suplidor_id: orden.suplidores?.id || "",
        suplidor_nombre: orden.suplidores?.nombre || "",
        fecha: orden.fecha,
        vencimiento: vencimiento.toISOString().split("T")[0],
        monto: orden.total,
        balance,
        estado,
        dias_vencido: diasVencido,
      }
    }),
  )

  return cuentas.filter((c) => c.balance > 0)
}

// Get cuentas por pagar by suplidor
export async function getCuentasPorPagarBySuplidor(empresaId: string, suplidorId: string) {
  const todasLasCuentas = await getCuentasPorPagar(empresaId)
  return todasLasCuentas.filter((cuenta) => cuenta.suplidor_id === suplidorId)
}

// Get orden balance (total - pagos)
async function getOrdenBalance(ordenId: string, empresaId: string): Promise<number> {
  // Get orden total
  const { data: orden, error: ordenError } = await supabase
    .from("ordenes_compra")
    .select("total")
    .eq("id", ordenId)
    .eq("empresa_id", empresaId)
    .single()

  if (ordenError || !orden) {
    return 0
  }

  // Get sum of pagos for this orden
  const { data: pagos, error: pagosError } = await supabase
    .from("pagos_suplidores")
    .select("monto")
    .eq("orden_compra_id", ordenId)
    .eq("empresa_id", empresaId)

  if (pagosError) {
    return orden.total
  }

  const totalPagado = pagos?.reduce((sum, pago) => sum + (pago.monto || 0), 0) || 0
  return Math.max(0, orden.total - totalPagado)
}

export async function getAllCuentasPagar() {
  // TODO: Get empresaId from authenticated user context
  const empresaId = "00000000-0000-0000-0000-000000000000"
  return getCuentasPorPagar(empresaId)
}
