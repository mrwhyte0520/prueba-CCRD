"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Save, Calculator } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function IR3Page() {
  const [formData, setFormData] = useState({
    periodo: "2024",
    ingresosOperacionales: 5000000,
    otrosIngresos: 100000,
    costosVentas: 2000000,
    gastosOperacionales: 1500000,
    gastosFinancieros: 200000,
    otrosGastos: 50000,
    anticiposISR: 150000,
    retencionesISR: 80000,
    saldoFavorAnterior: 0,
  })

  const totalIngresos = formData.ingresosOperacionales + formData.otrosIngresos
  const totalCostosGastos =
    formData.costosVentas + formData.gastosOperacionales + formData.gastosFinancieros + formData.otrosGastos
  const rentaNeta = totalIngresos - totalCostosGastos
  const isrCalculado = rentaNeta * 0.27 // 27% tasa ISR
  const isrPagar = Math.max(
    isrCalculado - formData.anticiposISR - formData.retencionesISR - formData.saldoFavorAnterior,
    0,
  )
  const saldoFavor = Math.max(
    formData.anticiposISR + formData.retencionesISR + formData.saldoFavorAnterior - isrCalculado,
    0,
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Formulario IR-3</h1>
              <p className="text-muted-foreground">
                Declaración Jurada del Impuesto Sobre la Renta (ISR) - Personas Jurídicas
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Datos de la Declaración</CardTitle>
                  <CardDescription>Complete la información del año fiscal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Año Fiscal</Label>
                    <Input
                      id="periodo"
                      type="number"
                      value={formData.periodo}
                      onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Ingresos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ingresosOperacionales">Ingresos Operacionales</Label>
                        <Input
                          id="ingresosOperacionales"
                          type="number"
                          value={formData.ingresosOperacionales}
                          onChange={(e) =>
                            setFormData({ ...formData, ingresosOperacionales: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otrosIngresos">Otros Ingresos</Label>
                        <Input
                          id="otrosIngresos"
                          type="number"
                          value={formData.otrosIngresos}
                          onChange={(e) =>
                            setFormData({ ...formData, otrosIngresos: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="font-semibold">Total Ingresos</Label>
                        <Input
                          type="text"
                          value={`RD$ ${totalIngresos.toLocaleString()}`}
                          disabled
                          className="font-semibold bg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Costos y Gastos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="costosVentas">Costos de Ventas</Label>
                        <Input
                          id="costosVentas"
                          type="number"
                          value={formData.costosVentas}
                          onChange={(e) =>
                            setFormData({ ...formData, costosVentas: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gastosOperacionales">Gastos Operacionales</Label>
                        <Input
                          id="gastosOperacionales"
                          type="number"
                          value={formData.gastosOperacionales}
                          onChange={(e) =>
                            setFormData({ ...formData, gastosOperacionales: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gastosFinancieros">Gastos Financieros</Label>
                        <Input
                          id="gastosFinancieros"
                          type="number"
                          value={formData.gastosFinancieros}
                          onChange={(e) =>
                            setFormData({ ...formData, gastosFinancieros: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otrosGastos">Otros Gastos</Label>
                        <Input
                          id="otrosGastos"
                          type="number"
                          value={formData.otrosGastos}
                          onChange={(e) => setFormData({ ...formData, otrosGastos: Number.parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="font-semibold">Total Costos y Gastos</Label>
                        <Input
                          type="text"
                          value={`RD$ ${totalCostosGastos.toLocaleString()}`}
                          disabled
                          className="font-semibold bg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Anticipos y Retenciones</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="anticiposISR">Anticipos ISR</Label>
                        <Input
                          id="anticiposISR"
                          type="number"
                          value={formData.anticiposISR}
                          onChange={(e) =>
                            setFormData({ ...formData, anticiposISR: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="retencionesISR">Retenciones ISR</Label>
                        <Input
                          id="retencionesISR"
                          type="number"
                          value={formData.retencionesISR}
                          onChange={(e) =>
                            setFormData({ ...formData, retencionesISR: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="saldoFavor">Saldo a Favor Año Anterior</Label>
                        <Input
                          id="saldoFavor"
                          type="number"
                          value={formData.saldoFavorAnterior}
                          onChange={(e) =>
                            setFormData({ ...formData, saldoFavorAnterior: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Resumen de Liquidación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Total Ingresos:</span>
                        <span className="font-medium text-green-600">RD$ {totalIngresos.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Costos/Gastos:</span>
                        <span className="font-medium text-red-600">-RD$ {totalCostosGastos.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-sm">
                        <span className="font-semibold">Renta Neta:</span>
                        <span className="font-semibold">RD$ {rentaNeta.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ISR (27%):</span>
                        <span className="font-medium">RD$ {isrCalculado.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Anticipos ISR:</span>
                        <span className="font-medium text-red-600">-RD$ {formData.anticiposISR.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Retenciones ISR:</span>
                        <span className="font-medium text-red-600">
                          -RD$ {formData.retencionesISR.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Saldo a Favor Anterior:</span>
                        <span className="font-medium text-red-600">
                          -RD$ {formData.saldoFavorAnterior.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-3">
                        {isrPagar > 0 ? (
                          <div className="flex justify-between">
                            <span className="font-semibold">ISR a Pagar:</span>
                            <span className="font-bold text-lg text-primary">RD$ {isrPagar.toLocaleString()}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span className="font-semibold">Saldo a Favor:</span>
                            <span className="font-bold text-lg text-green-600">RD$ {saldoFavor.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900 text-sm">Información</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-blue-800 space-y-2">
                    <p>El formulario IR-3 debe presentarse anualmente antes del 31 de marzo del año siguiente.</p>
                    <p>La tasa del ISR para personas jurídicas es del 27% sobre la renta neta imponible.</p>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Borrador
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline" size="lg">
                    <FileText className="mr-2 h-4 w-4" />
                    Generar PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
