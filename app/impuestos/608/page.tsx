"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Upload, Plus, Trash2, Search } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import * as impuestosService from "@/lib/services/impuestos.service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Cancelacion {
  id: string
  tipoComprobante: string
  ncfInicio: string
  ncfFin: string
  cantidad: number
  fechaCancelacion: string
  motivo: string
}



export default function Form608Page() {
  const [cancelaciones, setCancelaciones] = useState<Cancelacion[]>([])
  const [periodo, setPeriodo] = useState("2024-03")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCancelacion, setNewCancelacion] = useState({
    tipoComprobante: "",
    ncfInicio: "",
    ncfFin: "",
    cantidad: "",
    fechaCancelacion: "",
    motivo: "",
  })

  useEffect(() => {
    loadCancelaciones()
  }, [periodo])

  const loadCancelaciones = async () => {
    try {
      setIsLoading(true)
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501" // TODO: Get from auth
      const data = await impuestosService.getReportes608(empresaId, periodo)

      const cancelacionesFormateadas = data.map((r: any) => ({
        id: r.id,
        tipoComprobante: r.tipo_comprobante,
        ncfInicio: r.ncf_inicio,
        ncfFin: r.ncf_fin,
        cantidad: r.cantidad,
        fechaCancelacion: r.fecha_cancelacion,
        motivo: r.motivo,
      }))

      setCancelaciones(cancelacionesFormateadas)
    } catch (error) {
      console.error("[v0] Error loading cancelaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCancelaciones = cancelaciones.filter(
    (c) =>
      c.ncfInicio.includes(searchTerm) ||
      c.ncfFin.includes(searchTerm) ||
      c.motivo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalCancelados = cancelaciones.reduce((sum, c) => sum + c.cantidad, 0)

  const handleAddCancelacion = async () => {
    try {
      const cantidad = Number.parseInt(newCancelacion.cantidad) || 1

      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501" // TODO: Get from auth

      await impuestosService.createReporte608(empresaId, {
  periodo: periodo, // tu estado de periodo
  ncf_anulado: newCancelacion.ncfInicio, // o según corresponda
  fecha_emision_ncf_anulado: newCancelacion.fechaCancelacion,
  tipo_anulacion: newCancelacion.tipoComprobante,
  ncf_modificado: newCancelacion.ncfFin, // opcional
  monto_facturado: cantidad,
  itbis_facturado: 0, // si no manejas ITBIS puedes poner 0
  motivo_anulacion: newCancelacion.motivo,
})

      await loadCancelaciones()

      setIsDialogOpen(false)
      setNewCancelacion({
        tipoComprobante: "",
        ncfInicio: "",
        ncfFin: "",
        cantidad: "",
        fechaCancelacion: "",
        motivo: "",
      })
    } catch (error) {
      console.error("[v0] Error adding cancelacion:", error)
    }
  }

  const handleDeleteCancelacion = async (cancelacionId: string) => {
    try {
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501" // TODO: Get from auth
      await impuestosService.deleteReporte608(cancelacionId, empresaId)
      await loadCancelaciones()
    } catch (error) {
      console.error("[v0] Error deleting cancelacion:", error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Formulario 608</h1>
                <p className="text-muted-foreground">Declaración de Cancelación de Comprobantes Fiscales</p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="month"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-[180px]"
                />
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Excel
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cancelaciones</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cancelaciones.length}</div>
                  <p className="text-xs text-muted-foreground">Registros</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">NCF Cancelados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{totalCancelados}</div>
                  <p className="text-xs text-muted-foreground">Comprobantes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-sm">
                    Pendiente Envío
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">A DGII</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Detalle de Cancelaciones</CardTitle>
                    <CardDescription>Registro de comprobantes fiscales cancelados</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-[250px]"
                      />
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Cancelación
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-muted-foreground">Cargando cancelaciones...</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left text-sm font-medium">Tipo</th>
                            <th className="p-3 text-left text-sm font-medium">NCF Inicio</th>
                            <th className="p-3 text-left text-sm font-medium">NCF Fin</th>
                            <th className="p-3 text-center text-sm font-medium">Cantidad</th>
                            <th className="p-3 text-left text-sm font-medium">Fecha Cancelación</th>
                            <th className="p-3 text-left text-sm font-medium">Motivo</th>
                            <th className="p-3 text-center text-sm font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCancelaciones.map((cancelacion) => (
                            <tr key={cancelacion.id} className="border-b hover:bg-muted/50">
                              <td className="p-3 text-sm">
                                <Badge variant="outline">{cancelacion.tipoComprobante}</Badge>
                              </td>
                              <td className="p-3 text-sm font-mono">{cancelacion.ncfInicio}</td>
                              <td className="p-3 text-sm font-mono">{cancelacion.ncfFin}</td>
                              <td className="p-3 text-center text-sm font-semibold text-red-600">
                                {cancelacion.cantidad}
                              </td>
                              <td className="p-3 text-sm">
                                {new Date(cancelacion.fechaCancelacion).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-sm">{cancelacion.motivo}</td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCancelacion(cancelacion.id)}
                                  >
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
                            <td className="p-3 text-center text-sm text-red-600">{totalCancelados}</td>
                            <td colSpan={3}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 text-sm">Información Importante</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-amber-800 space-y-2">
                <p>
                  <strong>Motivos válidos de cancelación:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Comprobantes dañados o deteriorados</li>
                  <li>Errores en la impresión</li>
                  <li>Comprobantes extraviados</li>
                  <li>Cambio de razón social</li>
                </ul>
                <p className="pt-2">
                  El formulario 608 debe presentarse dentro de los 15 días siguientes a la cancelación de los
                  comprobantes.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar TXT
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generar PDF
              </Button>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Cancelación</DialogTitle>
            <DialogDescription>Ingrese los datos de la cancelación de comprobantes fiscales</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoComprobante">Tipo de Comprobante</Label>
                <Input
                  id="tipoComprobante"
                  placeholder="01"
                  value={newCancelacion.tipoComprobante}
                  onChange={(e) => setNewCancelacion({ ...newCancelacion, tipoComprobante: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  placeholder="1"
                  value={newCancelacion.cantidad}
                  onChange={(e) => setNewCancelacion({ ...newCancelacion, cantidad: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ncfInicio">NCF Inicio</Label>
                <Input
                  id="ncfInicio"
                  placeholder="B0100000050"
                  value={newCancelacion.ncfInicio}
                  onChange={(e) => setNewCancelacion({ ...newCancelacion, ncfInicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ncfFin">NCF Fin</Label>
                <Input
                  id="ncfFin"
                  placeholder="B0100000055"
                  value={newCancelacion.ncfFin}
                  onChange={(e) => setNewCancelacion({ ...newCancelacion, ncfFin: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaCancelacion">Fecha de Cancelación</Label>
              <Input
                id="fechaCancelacion"
                type="date"
                value={newCancelacion.fechaCancelacion}
                onChange={(e) => setNewCancelacion({ ...newCancelacion, fechaCancelacion: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de Cancelación</Label>
              <Input
                id="motivo"
                placeholder="Comprobantes dañados"
                value={newCancelacion.motivo}
                onChange={(e) => setNewCancelacion({ ...newCancelacion, motivo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCancelacion}>Agregar Cancelación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
