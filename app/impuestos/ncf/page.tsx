"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import * as ncfService from "@/lib/services/ncf.service"

interface SecuenciaNcf {
  id: string
  tipo: string
  descripcion: string
  serie: string
  desde: number
  hasta: number
  actual: number
  disponibles: number
  estado: "Activa" | "Por Vencer" | "Agotada"
  fechaVencimiento: string
}

export default function NCFPage() {
  const [secuencias, setSecuencias] = useState<SecuenciaNcf[]>([])
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [loading, setLoading] = useState(true)
const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
  useEffect(() => {
    loadSecuencias()
  }, [])

  const loadSecuencias = async () => {
    try {
      setLoading(true)
      const data = await ncfService.getSecuenciasNCF(empresaId)
      setSecuencias(
        data.map((seq) => ({
          id: seq.id,
          tipo: seq.tipo_comprobante,
          descripcion: getTipoDescripcion(seq.tipo_comprobante),
          serie: seq.serie,
          desde: seq.desde,
          hasta: seq.hasta,
          actual: seq.actual,
          disponibles: seq.hasta - seq.actual,
          estado: getEstadoSecuencia(seq),
          fechaVencimiento: seq.fecha_vencimiento,
        })),
      )
    } catch (error) {
      console.error("Error loading secuencias:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoDescripcion = (tipo: string) => {
    const tipos: Record<string, string> = {
      "01": "Facturas de Crédito Fiscal",
      "02": "Facturas de Consumo",
      "14": "Facturas Régimen Especial",
      "15": "Comprobantes Gubernamentales",
    }
    return tipos[tipo] || tipo
  }

  const getEstadoSecuencia = (seq: any): "Activa" | "Por Vencer" | "Agotada" => {
    const disponibles = seq.hasta - seq.actual
    const porcentaje = (seq.actual / seq.hasta) * 100

    if (disponibles === 0) return "Agotada"
    if (porcentaje > 90) return "Por Vencer"
    return "Activa"
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activa":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Activa
          </Badge>
        )
      case "Por Vencer":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3" />
            Por Vencer
          </Badge>
        )
      case "Agotada":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Agotada
          </Badge>
        )
      default:
        return null
    }
  }

  const getPorcentajeUso = (actual: number, hasta: number) => {
    return ((actual / hasta) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando secuencias NCF...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gestión de NCF</h1>
                <p className="text-muted-foreground">Números de Comprobante Fiscal</p>
              </div>
              <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Secuencia
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nueva Secuencia de NCF</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Comprobante</Label>
                      <Select>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">01 - Facturas de Crédito Fiscal</SelectItem>
                          <SelectItem value="02">02 - Facturas de Consumo</SelectItem>
                          <SelectItem value="14">14 - Facturas Régimen Especial</SelectItem>
                          <SelectItem value="15">15 - Comprobantes Gubernamentales</SelectItem>
                          <SelectItem value="03">03 - Notas de Débito</SelectItem>
                          <SelectItem value="04">04 - Notas de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serie">Serie</Label>
                      <Input id="serie" placeholder="Ej: B01" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="desde">Desde</Label>
                        <Input id="desde" type="number" placeholder="1" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hasta">Hasta</Label>
                        <Input id="hasta" type="number" placeholder="10000" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vencimiento">Fecha de Vencimiento</Label>
                      <Input id="vencimiento" type="date" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setDialogAbierto(false)}>Guardar Secuencia</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Secuencias Activas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{secuencias.filter((s) => s.estado === "Activa").length}</div>
                  <p className="text-xs text-muted-foreground">En uso</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{secuencias.filter((s) => s.estado === "Por Vencer").length}</div>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {secuencias.reduce((sum, s) => sum + s.disponibles, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">NCF sin usar</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Usados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {secuencias.reduce((sum, s) => sum + s.actual, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">NCF emitidos</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Secuencias de NCF</CardTitle>
                <CardDescription>Gestión de secuencias de comprobantes fiscales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {secuencias.map((secuencia) => (
                    <Card key={secuencia.id} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                Tipo {secuencia.tipo} - {secuencia.descripcion}
                              </h3>
                              {getEstadoBadge(secuencia.estado)}
                            </div>
                            <p className="text-sm text-muted-foreground">Serie: {secuencia.serie}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver Detalles
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Desde</p>
                            <p className="font-medium">{secuencia.desde.toString().padStart(8, "0")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Hasta</p>
                            <p className="font-medium">{secuencia.hasta.toString().padStart(8, "0")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Actual</p>
                            <p className="font-medium">{secuencia.actual.toString().padStart(8, "0")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Disponibles</p>
                            <p className="font-medium text-green-600">{secuencia.disponibles.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Vencimiento</p>
                            <p className="font-medium">{new Date(secuencia.fechaVencimiento).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uso de la secuencia</span>
                            <span className="font-medium">{getPorcentajeUso(secuencia.actual, secuencia.hasta)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                Number.parseFloat(getPorcentajeUso(secuencia.actual, secuencia.hasta)) > 90
                                  ? "bg-red-600"
                                  : Number.parseFloat(getPorcentajeUso(secuencia.actual, secuencia.hasta)) > 70
                                    ? "bg-yellow-600"
                                    : "bg-green-600"
                              }`}
                              style={{ width: `${getPorcentajeUso(secuencia.actual, secuencia.hasta)}%` }}
                            />
                          </div>
                        </div>

                        {secuencia.estado === "Por Vencer" && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <AlertTriangle className="inline h-4 w-4 mr-1" />
                              Esta secuencia está por agotarse. Solicite una nueva secuencia a la DGII.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Información sobre NCF</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Tipo 01:</strong> Facturas de Crédito Fiscal - Para contribuyentes registrados en el ITBIS
                </p>
                <p>
                  <strong>Tipo 02:</strong> Facturas de Consumo - Para consumidores finales
                </p>
                <p>
                  <strong>Tipo 14:</strong> Facturas Régimen Especial - Para contribuyentes en régimen especial
                </p>
                <p>
                  <strong>Tipo 15:</strong> Comprobantes Gubernamentales - Para ventas al Estado
                </p>
                <p className="pt-2 border-t border-blue-200">
                  Los NCF deben solicitarse a la DGII con anticipación y tienen una vigencia de 2 años desde su
                  autorización.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
