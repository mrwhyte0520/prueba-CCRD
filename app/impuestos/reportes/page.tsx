"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, TrendingUp, DollarSign, Receipt, FileBarChart } from "lucide-react"

interface ReporteImpuesto {
  mes: string
  ventasBrutas: number
  itbisVentas: number
  comprasBrutas: number
  itbisCompras: number
  itbisPagar: number
  isr: number
}

const mockReportes: ReporteImpuesto[] = [
  {
    mes: "Enero 2024",
    ventasBrutas: 1500000,
    itbisVentas: 270000,
    comprasBrutas: 800000,
    itbisCompras: 144000,
    itbisPagar: 126000,
    isr: 189000,
  },
  {
    mes: "Febrero 2024",
    ventasBrutas: 1650000,
    itbisVentas: 297000,
    comprasBrutas: 850000,
    itbisCompras: 153000,
    itbisPagar: 144000,
    isr: 216000,
  },
  {
    mes: "Marzo 2024",
    ventasBrutas: 1800000,
    itbisVentas: 324000,
    comprasBrutas: 900000,
    itbisCompras: 162000,
    itbisPagar: 162000,
    isr: 243000,
  },
]

export default function ReportesImpuestosPage() {
  const [reportes] = useState<ReporteImpuesto[]>(mockReportes)
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedMonth, setSelectedMonth] = useState("Marzo 2024")

  const reporteSeleccionado = reportes.find((r) => r.mes === selectedMonth) || reportes[reportes.length - 1]

  const totalVentas = reportes.reduce((sum, r) => sum + r.ventasBrutas, 0)
  const totalITBISPagar = reportes.reduce((sum, r) => sum + r.itbisPagar, 0)
  const totalISR = reportes.reduce((sum, r) => sum + r.isr, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes de Impuestos</h1>
          <p className="text-muted-foreground">Análisis y reportes fiscales detallados</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RD$ {totalVentas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Año {selectedYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ITBIS a Pagar</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RD$ {totalITBISPagar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Acumulado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ISR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RD$ {totalISR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total año</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carga Fiscal</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalITBISPagar / totalVentas) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">% sobre ventas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detalle Mensual de Impuestos</CardTitle>
              <CardDescription>Resumen de obligaciones fiscales por mes</CardDescription>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportes.map((reporte) => (
                  <SelectItem key={reporte.mes} value={reporte.mes}>
                    {reporte.mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">ITBIS (IVA)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Ventas Brutas</span>
                  <span className="font-medium">RD$ {reporteSeleccionado.ventasBrutas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">ITBIS en Ventas (18%)</span>
                  <span className="font-medium text-green-600">
                    RD$ {reporteSeleccionado.itbisVentas.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Compras Brutas</span>
                  <span className="font-medium">RD$ {reporteSeleccionado.comprasBrutas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">ITBIS en Compras (18%)</span>
                  <span className="font-medium text-red-600">
                    RD$ {reporteSeleccionado.itbisCompras.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary">
                  <span className="font-semibold">ITBIS a Pagar</span>
                  <span className="font-bold text-lg">RD$ {reporteSeleccionado.itbisPagar.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">ISR (Impuesto Sobre la Renta)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Ingresos Gravables</span>
                  <span className="font-medium">RD$ {reporteSeleccionado.ventasBrutas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Gastos Deducibles</span>
                  <span className="font-medium">RD$ {reporteSeleccionado.comprasBrutas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Renta Neta</span>
                  <span className="font-medium">
                    RD$ {(reporteSeleccionado.ventasBrutas - reporteSeleccionado.comprasBrutas).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary">
                  <span className="font-semibold">ISR a Pagar (27%)</span>
                  <span className="font-bold text-lg">RD$ {reporteSeleccionado.isr.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen Anual de Impuestos</CardTitle>
          <CardDescription>Comparativo mensual de obligaciones fiscales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Mes</th>
                    <th className="p-3 text-right text-sm font-medium">Ventas</th>
                    <th className="p-3 text-right text-sm font-medium">ITBIS Ventas</th>
                    <th className="p-3 text-right text-sm font-medium">Compras</th>
                    <th className="p-3 text-right text-sm font-medium">ITBIS Compras</th>
                    <th className="p-3 text-right text-sm font-medium">ITBIS a Pagar</th>
                    <th className="p-3 text-right text-sm font-medium">ISR</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.map((reporte, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm font-medium">{reporte.mes}</td>
                      <td className="p-3 text-right text-sm">RD$ {reporte.ventasBrutas.toLocaleString()}</td>
                      <td className="p-3 text-right text-sm text-green-600">
                        RD$ {reporte.itbisVentas.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-sm">RD$ {reporte.comprasBrutas.toLocaleString()}</td>
                      <td className="p-3 text-right text-sm text-red-600">
                        RD$ {reporte.itbisCompras.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-sm font-medium">RD$ {reporte.itbisPagar.toLocaleString()}</td>
                      <td className="p-3 text-right text-sm font-medium">RD$ {reporte.isr.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-semibold">
                    <td className="p-3 text-sm">TOTAL</td>
                    <td className="p-3 text-right text-sm">RD$ {totalVentas.toLocaleString()}</td>
                    <td className="p-3 text-right text-sm text-green-600">
                      RD$ {reportes.reduce((sum, r) => sum + r.itbisVentas, 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-sm">
                      RD$ {reportes.reduce((sum, r) => sum + r.comprasBrutas, 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-sm text-red-600">
                      RD$ {reportes.reduce((sum, r) => sum + r.itbisCompras, 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-sm">RD$ {totalITBISPagar.toLocaleString()}</td>
                    <td className="p-3 text-right text-sm">RD$ {totalISR.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reportes Disponibles</CardTitle>
            <CardDescription>Descargue reportes fiscales en diferentes formatos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Reporte de ITBIS Mensual (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Reporte de ISR Anual (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Libro de Ventas (Excel)
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Libro de Compras (Excel)
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Resumen Fiscal Anual (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Recordatorios Fiscales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-600 mt-1.5" />
              <p>
                <strong>IT-1:</strong> Vence el día 20 de cada mes
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-600 mt-1.5" />
              <p>
                <strong>606/607/608:</strong> Vencen el día 15 de cada mes
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-600 mt-1.5" />
              <p>
                <strong>IR-17:</strong> Vence el 30 de abril de cada año
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-600 mt-1.5" />
              <p>Mantenga sus comprobantes fiscales organizados y archivados por 10 años</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
