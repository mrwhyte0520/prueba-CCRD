"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as reportesContablesService from "@/lib/services/reportes-contables.service"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"

const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export default function EstadoResultadosPage() {
  const [fechaInicio, setFechaInicio] = useState("2025-01-01")
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [ingresos, setIngresos] = useState<any[]>([])
  const [gastos, setGastos] = useState<any[]>([])

  useEffect(() => {
    loadEstadoResultados()
  }, [])

  const loadEstadoResultados = async () => {
    try {
      setLoading(true)
      const estado = await reportesContablesService.getEstadoResultados(PLACEHOLDER_EMPRESA_ID, fechaInicio, fechaFin)
      setIngresos(estado.ingresos.cuentas)
      setGastos(estado.gastos.cuentas)
    } catch (error) {
      console.error("Error loading estado de resultados:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalIngresos = ingresos.reduce((sum, c) => sum + (c.monto || 0), 0)
  const totalGastos = gastos.reduce((sum, c) => sum + (c.monto || 0), 0)
  const utilidadNeta = totalIngresos - totalGastos

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando estado de resultados...</p>
              </div>
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Estado de Resultados</h1>
              <p className="text-muted-foreground">Estado de pérdidas y ganancias</p>
            </div>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="fecha-fin">Fecha Fin</Label>
                  <Input id="fecha-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
                <Button variant="outline" onClick={loadEstadoResultados}>
                  Generar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader className="bg-success text-success-foreground">
                <CardTitle>INGRESOS</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {ingresos
                    .filter((c) => c.nivel <= 2)
                    .map((cuenta) => (
                      <div key={cuenta.id} className="flex justify-between border-b pb-2">
                        <div>
                          <p className={`${cuenta.nivel === 1 ? "font-bold" : "ml-4"}`}>{cuenta.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono">{cuenta.codigo}</p>
                        </div>
                        <p className={`font-medium ${cuenta.nivel === 1 ? "font-bold" : ""}`}>
                          RD$ {(cuenta.monto || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  <div className="flex justify-between border-t-2 pt-4">
                    <p className="text-lg font-bold">TOTAL INGRESOS</p>
                    <p className="text-lg font-bold text-success">RD$ {totalIngresos.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-warning text-warning-foreground">
                <CardTitle>GASTOS</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {gastos
                    .filter((c) => c.nivel <= 2)
                    .map((cuenta) => (
                      <div key={cuenta.id} className="flex justify-between border-b pb-2">
                        <div>
                          <p className={`${cuenta.nivel === 1 ? "font-bold" : "ml-4"}`}>{cuenta.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono">{cuenta.codigo}</p>
                        </div>
                        <p className={`font-medium ${cuenta.nivel === 1 ? "font-bold" : ""}`}>
                          RD$ {(cuenta.monto || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  <div className="flex justify-between border-t-2 pt-4">
                    <p className="text-lg font-bold">TOTAL GASTOS</p>
                    <p className="text-lg font-bold text-warning">RD$ {totalGastos.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Ingresos Totales</span>
                    <span className="font-semibold">RD$ {totalIngresos.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Gastos Totales</span>
                    <span className="font-semibold">RD$ {totalGastos.toLocaleString()}</span>
                  </div>
                  <div className="border-t-2 pt-4">
                    <div className="flex justify-between">
                      <p className="text-2xl font-bold">{utilidadNeta >= 0 ? "UTILIDAD NETA" : "PÉRDIDA NETA"}</p>
                      <p className={`text-2xl font-bold ${utilidadNeta >= 0 ? "text-success" : "text-destructive"}`}>
                        RD$ {Math.abs(utilidadNeta).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-4 mt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Margen de Utilidad</p>
                        <p className="text-lg font-semibold">
                          {totalIngresos > 0 ? ((utilidadNeta / totalIngresos) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Período</p>
                        <p className="text-lg font-semibold">
                          {new Date(fechaInicio).toLocaleDateString("es-DO")} -{" "}
                          {new Date(fechaFin).toLocaleDateString("es-DO")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
