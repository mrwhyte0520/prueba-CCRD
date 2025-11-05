"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingDown, FileText, Calculator } from "lucide-react"
import * as depreciacionService from "@/lib/services/depreciacion.service"

interface DepreciacionMensual {
  mes: string
  depreciacionMensual: number
  depreciacionAcumulada: number
  valorNeto: number
}

interface ActivoDepreciacion {
  id: string
  codigo: string
  descripcion: string
  costoAdquisicion: number
  vidaUtil: number
  valorResidual: number
  metodoDepreciacion: string
  depreciacionAnual: number
  depreciacionMensual: number
  depreciacionAcumulada: number
  valorNeto: number
  mesesDepreciados: number
  mesesRestantes: number
}

export default function DepreciacionPage() {
  const [activos, setActivos] = useState<ActivoDepreciacion[]>([])
  const [selectedActivo, setSelectedActivo] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("2024")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDepreciacion()
  }, [selectedYear])

  const loadDepreciacion = async () => {
    try {
      setLoading(true)
        const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
      const data = await depreciacionService.getDepreciacionesByYear(empresaId, Number.parseInt(selectedYear))
      const activosData = data.map((dep) => ({
        id: dep.activo_id,
        codigo: dep.activo?.codigo || "",
        descripcion: dep.activo?.descripcion || "",
        costoAdquisicion: dep.activo?.costo_adquisicion || 0,
        vidaUtil: dep.activo?.vida_util_anos || 0,
        valorResidual: dep.activo?.valor_residual || 0,
        metodoDepreciacion: dep.activo?.metodo_depreciacion || "",
        depreciacionAnual: dep.monto_anual,
        depreciacionMensual: dep.monto_mensual,
        depreciacionAcumulada: dep.depreciacion_acumulada,
        valorNeto: dep.valor_neto,
        mesesDepreciados: dep.mes,
        mesesRestantes: (dep.activo?.vida_util_anos || 0) * 12 - dep.mes,
      }))
      setActivos(activosData)
    } catch (error) {
      console.error("Error loading depreciacion:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalDepreciacionAnual = activos.reduce((sum, a) => sum + a.depreciacionAnual, 0)
  const totalDepreciacionMensual = activos.reduce((sum, a) => sum + a.depreciacionMensual, 0)
  const totalDepreciacionAcumulada = activos.reduce((sum, a) => sum + a.depreciacionAcumulada, 0)

  const generateDepreciacionMensual = (activo: ActivoDepreciacion): DepreciacionMensual[] => {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return meses.map((mes, index) => ({
      mes,
      depreciacionMensual: activo.depreciacionMensual,
      depreciacionAcumulada: activo.depreciacionMensual * (index + 1),
      valorNeto: activo.costoAdquisicion - activo.depreciacionMensual * (index + 1),
    }))
  }

  const activoSeleccionado = activos.find((a) => a.id === selectedActivo)
  const depreciacionMensual = activoSeleccionado ? generateDepreciacionMensual(activoSeleccionado) : []

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando depreciación...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Depreciación de Activos</h1>
              <p className="text-muted-foreground">Cálculo y seguimiento de la depreciación de activos fijos</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Depreciación Anual</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalDepreciacionAnual.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total año {selectedYear}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Depreciación Mensual</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalDepreciacionMensual.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Promedio mensual</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Depreciación Acumulada</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalDepreciacionAcumulada.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total histórico</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activos Depreciando</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activos.length}</div>
                  <p className="text-xs text-muted-foreground">En proceso</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de Depreciación por Activo</CardTitle>
                <CardDescription>Estado actual de depreciación de cada activo fijo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left text-sm font-medium">Código</th>
                          <th className="p-3 text-left text-sm font-medium">Descripción</th>
                          <th className="p-3 text-left text-sm font-medium">Método</th>
                          <th className="p-3 text-right text-sm font-medium">Dep. Anual</th>
                          <th className="p-3 text-right text-sm font-medium">Dep. Mensual</th>
                          <th className="p-3 text-right text-sm font-medium">Dep. Acumulada</th>
                          <th className="p-3 text-right text-sm font-medium">Valor Neto</th>
                          <th className="p-3 text-center text-sm font-medium">Progreso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activos.map((activo) => {
                          const porcentajeDepreciado = (activo.mesesDepreciados / (activo.vidaUtil * 12)) * 100
                          return (
                            <tr key={activo.id} className="border-b hover:bg-muted/50">
                              <td className="p-3 text-sm font-medium">{activo.codigo}</td>
                              <td className="p-3 text-sm">{activo.descripcion}</td>
                              <td className="p-3 text-sm">{activo.metodoDepreciacion}</td>
                              <td className="p-3 text-right text-sm">
                                RD$ {activo.depreciacionAnual.toLocaleString()}
                              </td>
                              <td className="p-3 text-right text-sm">
                                RD$ {activo.depreciacionMensual.toLocaleString()}
                              </td>
                              <td className="p-3 text-right text-sm text-red-600">
                                RD$ {activo.depreciacionAcumulada.toLocaleString()}
                              </td>
                              <td className="p-3 text-right text-sm font-medium">
                                RD$ {activo.valorNeto.toLocaleString()}
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full"
                                      style={{ width: `${porcentajeDepreciado}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {porcentajeDepreciado.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalle de Depreciación Mensual</CardTitle>
                <CardDescription>Proyección mensual de depreciación por activo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <Select value={selectedActivo} onValueChange={setSelectedActivo}>
                    <SelectTrigger className="w-full md:w-[400px]">
                      <SelectValue placeholder="Seleccionar activo" />
                    </SelectTrigger>
                    <SelectContent>
                      {activos.map((activo) => (
                        <SelectItem key={activo.id} value={activo.id}>
                          {activo.codigo} - {activo.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedActivo ? (
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left text-sm font-medium">Mes</th>
                            <th className="p-3 text-right text-sm font-medium">Depreciación Mensual</th>
                            <th className="p-3 text-right text-sm font-medium">Depreciación Acumulada</th>
                            <th className="p-3 text-right text-sm font-medium">Valor Neto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {depreciacionMensual.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="p-3 text-sm font-medium">{item.mes}</td>
                              <td className="p-3 text-right text-sm">
                                RD$ {item.depreciacionMensual.toLocaleString()}
                              </td>
                              <td className="p-3 text-right text-sm text-red-600">
                                RD$ {item.depreciacionAcumulada.toLocaleString()}
                              </td>
                              <td className="p-3 text-right text-sm font-medium">
                                RD$ {item.valorNeto.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Seleccione un activo para ver el detalle de depreciación mensual
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
