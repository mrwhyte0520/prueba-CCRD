"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, TrendingUp, PieChart, BarChart3 } from "lucide-react"

interface ReporteCategoria {
  categoria: string
  cantidad: number
  costoTotal: number
  depreciacionAcumulada: number
  valorNeto: number
  porcentaje: number
}

interface ReporteUbicacion {
  ubicacion: string
  cantidad: number
  valorTotal: number
}

const mockReporteCategorias: ReporteCategoria[] = [
  {
    categoria: "Equipos de Computación",
    cantidad: 15,
    costoTotal: 1275000,
    depreciacionAcumulada: 765000,
    valorNeto: 510000,
    porcentaje: 35,
  },
  {
    categoria: "Vehículos",
    cantidad: 5,
    costoTotal: 6250000,
    depreciacionAcumulada: 2500000,
    valorNeto: 3750000,
    porcentaje: 25,
  },
  {
    categoria: "Muebles y Enseres",
    cantidad: 30,
    costoTotal: 1350000,
    depreciacionAcumulada: 486000,
    valorNeto: 864000,
    porcentaje: 20,
  },
  {
    categoria: "Maquinaria",
    cantidad: 8,
    costoTotal: 3200000,
    depreciacionAcumulada: 1280000,
    valorNeto: 1920000,
    porcentaje: 15,
  },
  {
    categoria: "Edificios",
    cantidad: 2,
    costoTotal: 10000000,
    depreciacionAcumulada: 2000000,
    valorNeto: 8000000,
    porcentaje: 5,
  },
]

const mockReporteUbicaciones: ReporteUbicacion[] = [
  { ubicacion: "Oficina Principal", cantidad: 25, valorTotal: 5500000 },
  { ubicacion: "Sucursal Norte", cantidad: 15, valorTotal: 3200000 },
  { ubicacion: "Sucursal Este", cantidad: 12, valorTotal: 2800000 },
  { ubicacion: "Almacén Central", cantidad: 8, valorTotal: 1500000 },
]

export default function ReportesActivosPage() {
  const [tipoReporte, setTipoReporte] = useState("categorias")
  const [periodo, setPeriodo] = useState("2024")

  const totalActivos = mockReporteCategorias.reduce((sum, cat) => sum + cat.cantidad, 0)
  const totalCosto = mockReporteCategorias.reduce((sum, cat) => sum + cat.costoTotal, 0)
  const totalDepreciacion = mockReporteCategorias.reduce((sum, cat) => sum + cat.depreciacionAcumulada, 0)
  const totalValorNeto = mockReporteCategorias.reduce((sum, cat) => sum + cat.valorNeto, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes de Activos Fijos</h1>
          <p className="text-muted-foreground">Análisis y reportes detallados de activos fijos</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivos}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RD$ {(totalCosto / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Inversión total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depreciación Acum.</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">RD$ {(totalDepreciacion / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              {((totalDepreciacion / totalCosto) * 100).toFixed(1)}% del costo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Neto</CardTitle>
            <PieChart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">RD$ {(totalValorNeto / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Valor en libros</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reportes Detallados</CardTitle>
              <CardDescription>Análisis de activos por categoría y ubicación</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="categorias">Por Categoría</SelectItem>
                  <SelectItem value="ubicaciones">Por Ubicación</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tipoReporte === "categorias" ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium">Categoría</th>
                      <th className="p-3 text-center text-sm font-medium">Cantidad</th>
                      <th className="p-3 text-right text-sm font-medium">Costo Total</th>
                      <th className="p-3 text-right text-sm font-medium">Dep. Acumulada</th>
                      <th className="p-3 text-right text-sm font-medium">Valor Neto</th>
                      <th className="p-3 text-center text-sm font-medium">% del Total</th>
                      <th className="p-3 text-center text-sm font-medium">Distribución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockReporteCategorias.map((cat, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-sm font-medium">{cat.categoria}</td>
                        <td className="p-3 text-center text-sm">
                          <Badge variant="outline">{cat.cantidad}</Badge>
                        </td>
                        <td className="p-3 text-right text-sm">RD$ {cat.costoTotal.toLocaleString()}</td>
                        <td className="p-3 text-right text-sm text-red-600">
                          RD$ {cat.depreciacionAcumulada.toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-sm font-medium">RD$ {cat.valorNeto.toLocaleString()}</td>
                        <td className="p-3 text-center text-sm">
                          <Badge>{cat.porcentaje}%</Badge>
                        </td>
                        <td className="p-3">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${cat.porcentaje * 2}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-muted/30 font-bold">
                      <td className="p-3 text-sm">TOTAL</td>
                      <td className="p-3 text-center text-sm">
                        <Badge variant="default">{totalActivos}</Badge>
                      </td>
                      <td className="p-3 text-right text-sm">RD$ {totalCosto.toLocaleString()}</td>
                      <td className="p-3 text-right text-sm text-red-600">RD$ {totalDepreciacion.toLocaleString()}</td>
                      <td className="p-3 text-right text-sm">RD$ {totalValorNeto.toLocaleString()}</td>
                      <td className="p-3 text-center text-sm">100%</td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium">Ubicación</th>
                      <th className="p-3 text-center text-sm font-medium">Cantidad de Activos</th>
                      <th className="p-3 text-right text-sm font-medium">Valor Total</th>
                      <th className="p-3 text-center text-sm font-medium">Distribución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockReporteUbicaciones.map((ub, index) => {
                      const totalValorUbicaciones = mockReporteUbicaciones.reduce((sum, u) => sum + u.valorTotal, 0)
                      const porcentaje = (ub.valorTotal / totalValorUbicaciones) * 100
                      return (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm font-medium">{ub.ubicacion}</td>
                          <td className="p-3 text-center text-sm">
                            <Badge variant="outline">{ub.cantidad}</Badge>
                          </td>
                          <td className="p-3 text-right text-sm font-medium">RD$ {ub.valorTotal.toLocaleString()}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${porcentaje}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-12 text-right">
                                {porcentaje.toFixed(1)}%
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
