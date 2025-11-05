import { supabase } from "@/lib/supabaseClient"

export interface CuentaPorCobrar {
  id: string
  factura_numero: string
  cliente_id: string
  cliente_nombre?: string
  fecha: string
  vencimiento: string
  monto: number
  balance: number
  estado: "pendiente" | "parcial" | "vencida" | "pagada"
  dias_vencido: number
}

// Get all cuentas por cobrar for the current empresa
export async function getCuentasPorCobrar(empresaId: string) {
  const { data, error } = await supabase
    .from("facturas")
    .select(`
      id,
      numero,
      fecha,
      total,
      estado,
      clientes:cliente_id (
        id,
        nombre
      )
    `)
    .eq("empresa_id", empresaId)
    .in("estado", ["pendiente", "parcial"])
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching cuentas por cobrar:", error)
    throw error
  }

  // Calculate balance and days overdue for each factura
  const cuentas = await Promise.all(
    data.map(async (factura) => {
      const balance = await getFacturaBalance(factura.id, empresaId)
      const vencimiento = new Date(factura.fecha)
      vencimiento.setDate(vencimiento.getDate() + 30) // Default 30 days credit

      const hoy = new Date()
      const diasVencido = Math.max(0, Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24)))

      let estado: "pendiente" | "parcial" | "vencida" | "pagada" = "pendiente"
      if (balance === 0) {
        estado = "pagada"
      } else if (balance < factura.total) {
        estado = "parcial"
      } else if (diasVencido > 0) {
        estado = "vencida"
      }

      return {
        id: factura.id,
        factura_numero: factura.numero,
        cliente_id: factura.clientes?.[0]?.id || "",
         cliente_nombre: factura.clientes?.[0]?.nombre || "",
        fecha: factura.fecha,
        vencimiento: vencimiento.toISOString().split("T")[0],
        monto: factura.total,
        balance,
        estado,
        dias_vencido: diasVencido,
      }
    }),
  )

  return cuentas.filter((c) => c.balance > 0)
}

// Get cuentas por cobrar by cliente
export async function getCuentasPorCobrarByCliente(empresaId: string, clienteId: string) {
  const todasLasCuentas = await getCuentasPorCobrar(empresaId)
  return todasLasCuentas.filter((cuenta) => cuenta.cliente_id === clienteId)
}

// Get factura balance (total - pagos)
async function getFacturaBalance(facturaId: string, empresaId: string): Promise<number> {
  // Get factura total
  const { data: factura, error: facturaError } = await supabase
    .from("facturas")
    .select("total")
    .eq("id", facturaId)
    .eq("empresa_id", empresaId)
    .single()

  if (facturaError || !factura) {
    return 0
  }

  // Get sum of pagos for this factura
  const { data: pagos, error: pagosError } = await supabase
    .from("pagos_clientes")
    .select("monto")
    .eq("factura_id", facturaId)
    .eq("empresa_id", empresaId)

  if (pagosError) {
    return factura.total
  }

  const totalPagado = pagos?.reduce((sum, pago) => sum + (pago.monto || 0), 0) || 0
  return Math.max(0, factura.total - totalPagado)
}

// Get aging report (reporte de antigüedad)
export async function getAgingReport(empresaId: string) {
  const cuentas = await getCuentasPorCobrar(empresaId)

  const aging = {
    corriente: 0, // 0-30 days
    dias_30: 0, // 31-60 days
    dias_60: 0, // 61-90 days
    dias_90: 0, // 91+ days
    total: 0,
  }

  cuentas.forEach((cuenta) => {
    aging.total += cuenta.balance

    if (cuenta.dias_vencido === 0) {
      aging.corriente += cuenta.balance
    } else if (cuenta.dias_vencido <= 30) {
      aging.dias_30 += cuenta.balance
    } else if (cuenta.dias_vencido <= 60) {
      aging.dias_60 += cuenta.balance
    } else {
      aging.dias_90 += cuenta.balance
    }
  })

  return aging
}

export async function getAllCuentasCobrar() {
  const DEFAULT_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"
  return getCuentasPorCobrar(DEFAULT_EMPRESA_ID)
}
