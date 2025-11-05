import { supabase } from "@/lib/supabaseClient"

export interface ActivoFijo {
  id: string
  empresa_id: string
  codigo: string
  nombre: string
  descripcion: string | null
  categoria: string
  fecha_adquisicion: string
  costo_adquisicion: number
  vida_util_anos: number
  valor_residual: number
  metodo_depreciacion: "lineal" | "acelerada" | "unidades_produccion"
  ubicacion: string | null
  responsable: string | null
  estado: "activo" | "en_mantenimiento" | "dado_de_baja" | "vendido"
  valor_libro: number
  depreciacion_acumulada: number
  created_at?: string
  updated_at?: string
}

// Obtener todos los activos de una empresa
export async function getActivosFijos(empresaId: string) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("codigo", { ascending: true })

  if (error) throw error
  return data
}

// Obtener un activo por ID
export async function getActivoFijoById(activoId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .select("*")
    .eq("id", activoId)
    .eq("empresa_id", empresaId)
    .single()

  if (error) throw error
  return data
}

// Crear un nuevo activo
export async function createActivoFijo(
  empresaId: string,
  activoData: Omit<ActivoFijo, "id" | "empresa_id">
) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .insert({ empresa_id: empresaId, ...activoData })
    .select()
    .single()

  if (error) throw error
  return data
}

// Actualizar un activo existente
export async function updateActivoFijo(
  activoId: string,
  empresaId: string,
  activoData: Partial<ActivoFijo>
) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .update(activoData)
    .eq("id", activoId)
    .eq("empresa_id", empresaId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Eliminar un activo
export async function deleteActivoFijo(activoId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .delete()
    .eq("id", activoId)
    .eq("empresa_id", empresaId)

  if (error) throw error
  return data
}

// Depreciación
export function calcularDepreciacion(activo: ActivoFijo, meses: number): number {
  const costoDepreciable = activo.costo_adquisicion - activo.valor_residual
  const vidaUtilMeses = activo.vida_util_anos * 12

  if (activo.metodo_depreciacion === "lineal") {
    const depreciacionMensual = costoDepreciable / vidaUtilMeses
    return depreciacionMensual * meses
  }

  // Otros métodos no implementados
  return 0
}

// Filtrar activos por categoría
export async function getActivosByCategoria(empresaId: string, categoria: string) {
  const { data, error } = await supabase
    .from("activos_fijos")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("categoria", categoria)
    .order("codigo", { ascending: true })

  if (error) throw error
  return data
}

// Alias para compatibilidad
export async function getActivos(empresaId: string) {
  return getActivosFijos(empresaId)
}
