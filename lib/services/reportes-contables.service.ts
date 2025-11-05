import { supabase } from "@/lib/supabaseClient"

export interface LibroMayorEntry {
  fecha: string
  asiento_numero: string
  descripcion: string
  debe: number
  haber: number
  balance: number
}

export interface BalanceGeneralData {
  activos: {
    corrientes: { cuenta: string; balance: number }[]
    no_corrientes: { cuenta: string; balance: number }[]
    total: number
  }
  pasivos: {
    corrientes: { cuenta: string; balance: number }[]
    no_corrientes: { cuenta: string; balance: number }[]
    total: number
  }
  capital: {
    cuentas: { cuenta: string; balance: number }[]
    total: number
  }
}

export interface EstadoResultadosData {
  ingresos: {
    cuentas: { cuenta: string; monto: number }[]
    total: number
  }
  gastos: {
    cuentas: { cuenta: string; monto: number }[]
    total: number
  }
  utilidad_neta: number
}

// Get libro mayor for a specific account
export async function getLibroMayor(
  empresaId: string,
  cuentaId: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<LibroMayorEntry[]> {
  const { data, error } = await supabase
    .from("asientos_detalle")
    .select(`
      debe,
      haber,
      descripcion,
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
    .gte("asientos_contables.fecha", fechaInicio)
    .lte("asientos_contables.fecha", fechaFin)
    .order("asientos_contables.fecha", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching libro mayor:", error)
    throw error
  }

  // Calculate running balance
  let balance = 0
  const entries: LibroMayorEntry[] = data.map((item: any) => {
    balance += item.debe - item.haber
    return {
      fecha: item.asientos_contables.fecha,
      asiento_numero: item.asientos_contables.numero,
      descripcion: item.descripcion || item.asientos_contables.descripcion,
      debe: item.debe,
      haber: item.haber,
      balance,
    }
  })

  return entries
}

// Get balance general (balance sheet)
export async function getBalanceGeneral(empresaId: string, fecha: string): Promise<BalanceGeneralData> {
  const { data: cuentas, error } = await supabase
    .from("cuentas_contables")
    .select("codigo, nombre, tipo, subtipo, balance")
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching balance general:", error)
    throw error
  }

  const activos = cuentas.filter((c) => c.tipo === "activo")
  const pasivos = cuentas.filter((c) => c.tipo === "pasivo")
  const capital = cuentas.filter((c) => c.tipo === "capital")

  return {
    activos: {
      corrientes: activos
        .filter((c) => c.subtipo === "corriente")
        .map((c) => ({ cuenta: `${c.codigo} - ${c.nombre}`, balance: c.balance })),
      no_corrientes: activos
        .filter((c) => c.subtipo === "no_corriente")
        .map((c) => ({ cuenta: `${c.codigo} - ${c.nombre}`, balance: c.balance })),
      total: activos.reduce((sum, c) => sum + c.balance, 0),
    },
    pasivos: {
      corrientes: pasivos
        .filter((c) => c.subtipo === "corriente")
        .map((c) => ({ cuenta: `${c.codigo} - ${c.nombre}`, balance: c.balance })),
      no_corrientes: pasivos
        .filter((c) => c.subtipo === "no_corriente")
        .map((c) => ({ cuenta: `${c.codigo} - ${c.nombre}`, balance: c.balance })),
      total: pasivos.reduce((sum, c) => sum + c.balance, 0),
    },
    capital: {
      cuentas: capital.map((c) => ({ cuenta: `${c.codigo} - ${c.nombre}`, balance: c.balance })),
      total: capital.reduce((sum, c) => sum + c.balance, 0),
    },
  }
}

// Get estado de resultados (income statement)
export async function getEstadoResultados(
  empresaId: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<EstadoResultadosData> {
  const { data: cuentas, error } = await supabase
    .from("cuentas_contables")
    .select("codigo, nombre, tipo, balance")
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .in("tipo", ["ingreso", "gasto"])
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching estado de resultados:", error)
    throw error
  }

  const ingresos = cuentas.filter((c) => c.tipo === "ingreso")
  const gastos = cuentas.filter((c) => c.tipo === "gasto")

  const totalIngresos = ingresos.reduce((sum, c) => sum + c.balance, 0)
  const totalGastos = gastos.reduce((sum, c) => sum + c.balance, 0)

  return {
    ingresos: {
      cuentas: ingresos.map((c) => ({ cuenta: `${c.codigo} - ${c.nombre}`, monto: c.balance })),
      total: totalIngresos,
    },
    gastos: {
      cuentas: gastos.map((c) => ({ cuenta: `${c.codigo} - ${c.nombre}`, monto: c.balance })),
      total: totalGastos,
    },
    utilidad_neta: totalIngresos - totalGastos,
  }
}

// Get balance de comprobación (trial balance)
export async function getBalanceComprobacion(empresaId: string, fecha: string) {
  const { data, error } = await supabase
    .from("cuentas_contables")
    .select("codigo, nombre, naturaleza, balance")
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .order("codigo", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching balance de comprobación:", error)
    throw error
  }

  return data.map((cuenta) => ({
    codigo: cuenta.codigo,
    nombre: cuenta.nombre,
    debe: cuenta.naturaleza === "deudora" && cuenta.balance > 0 ? cuenta.balance : 0,
    haber: cuenta.naturaleza === "acreedora" && cuenta.balance > 0 ? cuenta.balance : 0,
  }))
}
