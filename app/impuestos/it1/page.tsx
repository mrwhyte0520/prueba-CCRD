"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Save, Calculator } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function IT1Page() {
  const [formData, setFormData] = useState({
    periodo: "2024-03",
    ventasBrutas: 1800000,
    ventasExentas: 0,
    ventasGravadas: 1800000,
    itbisVentas: 324000,
    comprasBrutas: 900000,
    comprasExentas: 0,
    comprasGravadas: 900000,
    itbisCompras: 162000,
    itbisRetenido: 0,
    adelantoITBIS: 0,
    saldoFavorMesAnterior: 0,
  })

  const itbisPagar = Math.max(
    formData.itbisVentas -
      formData.itbisCompras -
      formData.itbisRetenido -
      formData.adelantoITBIS -
      formData.saldoFavorMesAnterior,
    0,
  )

  const saldoFavor = Math.max(
    formData.itbisCompras +
      formData.itbisRetenido +
      formData.adelantoITBIS +
      formData.saldoFavorMesAnterior -
      formData.itbisVentas,
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
              <h1 className="text-3xl font-bold">Formulario IT-1</h1>
              <p className="text-muted-foreground">Declaración Jurada y/o Pago del ITBIS</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Datos de la Declaración</CardTitle>
                  <CardDescription>Complete la información del período fiscal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período Fiscal</Label>
                    <Input
                      id="periodo"
                      type="month"
                      value={formData.periodo}
                      onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Operaciones de Ventas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ventasBrutas">Ventas Brutas</Label>
                        <Input
                          id="ventasBrutas"
                          type="number"
                          value={formData.ventasBrutas}
                          onChange={(e) =>
                            setFormData({ ...formData, ventasBrutas: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ventasExentas">Ventas Exentas</Label>
                        <Input
                          id="ventasExentas"
                          type="number"
                          value={formData.ventasExentas}
                          onChange={(e) =>
                            setFormData({ ...formData, ventasExentas: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ventasGravadas">Ventas Gravadas</Label>
                        <Input
                          id="ventasGravadas"
                          type="number"
                          value={formData.ventasGravadas}
                          onChange={(e) =>
                            setFormData({ ...formData, ventasGravadas: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="itbisVentas">ITBIS en Ventas (18%)</Label>
                        <Input
                          id="itbisVentas"
                          type="number"
                          value={formData.itbisVentas}
                          onChange={(e) => setFormData({ ...formData, itbisVentas: Number.parseFloat(e.target.value) })}
                          className="font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Operaciones de Compras</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="comprasBrutas">Compras Brutas</Label>
                        <Input
                          id="comprasBrutas"
                          type="number"
                          value={formData.comprasBrutas}
                          onChange={(e) =>
                            setFormData({ ...formData, comprasBrutas: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comprasExentas">Compras Exentas</Label>
                        <Input
                          id="comprasExentas"
                          type="number"
                          value={formData.comprasExentas}
                          onChange={(e) =>
                            setFormData({ ...formData, comprasExentas: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comprasGravadas">Compras Gravadas</Label>
                        <Input
                          id="comprasGravadas"
                          type="number"
                          value={formData.comprasGravadas}
                          onChange={(e) =>
                            setFormData({ ...formData, comprasGravadas: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="itbisCompras">ITBIS en Compras (18%)</Label>
                        <Input
                          id="itbisCompras"
                          type="number"
                          value={formData.itbisCompras}
                          onChange={(e) =>
                            setFormData({ ...formData, itbisCompras: Number.parseFloat(e.target.value) })
                          }
                          className="font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Otros Conceptos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="itbisRetenido">ITBIS Retenido</Label>
                        <Input
                          id="itbisRetenido"
                          type="number"
                          value={formData.itbisRetenido}
                          onChange={(e) =>
                            setFormData({ ...formData, itbisRetenido: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adelantoITBIS">Adelanto ITBIS</Label>
                        <Input
                          id="adelantoITBIS"
                          type="number"
                          value={formData.adelantoITBIS}
                          onChange={(e) =>
                            setFormData({ ...formData, adelantoITBIS: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="saldoFavor">Saldo a Favor Mes Anterior</Label>
                        <Input
                          id="saldoFavor"
                          type="number"
                          value={formData.saldoFavorMesAnterior}
                          onChange={(e) =>
                            setFormData({ ...formData, saldoFavorMesAnterior: Number.parseFloat(e.target.value) })
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
                        <span>ITBIS en Ventas:</span>
                        <span className="font-medium text-green-600">RD$ {formData.itbisVentas.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ITBIS en Compras:</span>
                        <span className="font-medium text-red-600">-RD$ {formData.itbisCompras.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ITBIS Retenido:</span>
                        <span className="font-medium text-red-600">-RD$ {formData.itbisRetenido.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Adelanto ITBIS:</span>
                        <span className="font-medium text-red-600">-RD$ {formData.adelantoITBIS.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Saldo a Favor Anterior:</span>
                        <span className="font-medium text-red-600">
                          -RD$ {formData.saldoFavorMesAnterior.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-3">
                        {itbisPagar > 0 ? (
                          <div className="flex justify-between">
                            <span className="font-semibold">ITBIS a Pagar:</span>
                            <span className="font-bold text-lg text-primary">RD$ {itbisPagar.toLocaleString()}</span>
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
                    <p>El formulario IT-1 debe presentarse mensualmente antes del día 20 del mes siguiente.</p>
                    <p>La tasa general del ITBIS es del 18% sobre el valor de las operaciones gravadas.</p>
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
