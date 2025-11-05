"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Save, Plus, Trash2 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

interface Retencion {
  id: string
  beneficiario: string
  rnc: string
  concepto: string
  montoBase: number
  tasaRetencion: number
  montoRetenido: number
}

export default function IR17Page() {
  const [periodo, setPeriodo] = useState("2024-03")
  const [retenciones, setRetenciones] = useState<Retencion[]>([
    {
      id: "1",
      beneficiario: "Servicios Profesionales ABC",
      rnc: "131234567",
      concepto: "Servicios Profesionales",
      montoBase: 100000,
      tasaRetencion: 10,
      montoRetenido: 10000,
    },
    {
      id: "2",
      beneficiario: "Consultoría XYZ SRL",
      rnc: "131345678",
      concepto: "Consultoría",
      montoBase: 50000,
      tasaRetencion: 10,
      montoRetenido: 5000,
    },
  ])

  const totalMontoBase = retenciones.reduce((sum, r) => sum + r.montoBase, 0)
  const totalRetenido = retenciones.reduce((sum, r) => sum + r.montoRetenido, 0)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Formulario IR-17</h1>
                <p className="text-muted-foreground">Declaración y/o Pago de Retenciones del ISR</p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="month"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Retenciones</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retenciones.length}</div>
                  <p className="text-xs text-muted-foreground">Registros</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monto Base</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalMontoBase.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total pagado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Retenido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">RD$ {totalRetenido.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">A pagar a DGII</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Detalle de Retenciones</CardTitle>
                    <CardDescription>Registro de todas las retenciones del período</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Retención
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left text-sm font-medium">Beneficiario</th>
                          <th className="p-3 text-left text-sm font-medium">RNC</th>
                          <th className="p-3 text-left text-sm font-medium">Concepto</th>
                          <th className="p-3 text-right text-sm font-medium">Monto Base</th>
                          <th className="p-3 text-center text-sm font-medium">Tasa %</th>
                          <th className="p-3 text-right text-sm font-medium">Monto Retenido</th>
                          <th className="p-3 text-center text-sm font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retenciones.map((retencion) => (
                          <tr key={retencion.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-sm">{retencion.beneficiario}</td>
                            <td className="p-3 text-sm font-mono">{retencion.rnc}</td>
                            <td className="p-3 text-sm">{retencion.concepto}</td>
                            <td className="p-3 text-right text-sm">RD$ {retencion.montoBase.toLocaleString()}</td>
                            <td className="p-3 text-center text-sm font-medium">{retencion.tasaRetencion}%</td>
                            <td className="p-3 text-right text-sm font-semibold text-primary">
                              RD$ {retencion.montoRetenido.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-muted font-semibold">
                          <td colSpan={3} className="p-3 text-sm">
                            TOTALES
                          </td>
                          <td className="p-3 text-right text-sm">RD$ {totalMontoBase.toLocaleString()}</td>
                          <td></td>
                          <td className="p-3 text-right text-sm text-primary">RD$ {totalRetenido.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-sm">Información sobre Retenciones</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-800 space-y-2">
                <p>
                  <strong>Servicios Profesionales:</strong> 10% de retención sobre el monto pagado
                </p>
                <p>
                  <strong>Alquileres:</strong> 10% de retención sobre el monto del alquiler
                </p>
                <p>
                  <strong>Intereses:</strong> 10% de retención sobre los intereses pagados
                </p>
                <p className="pt-2">
                  El formulario IR-17 debe presentarse mensualmente antes del día 10 del mes siguiente.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="lg">
                <Save className="mr-2 h-4 w-4" />
                Guardar Borrador
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-4 w-4" />
                Generar PDF
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
