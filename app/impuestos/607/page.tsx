"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Upload, Plus, Trash2, Search } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import * as impuestosService from "@/lib/services/impuestos.service"

interface Venta {
  id: string
  rncCedula: string
  tipoComprobante: string
  ncf: string
  fecha: string
  cliente: string
  montoGravado: number
  itbis: number
  total: number
}

interface Cancelacion {
  id: string
  ncfModificado: string
  tipoComprobante: string
  ncfCancelacion: string
  fecha: string
  motivo: string
}

export default function Form607Page() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [cancelaciones, setCancelaciones] = useState<Cancelacion[]>([])
  const [periodo, setPeriodo] = useState("2024-03")
  const [searchTerm, setSearchTerm] = useState("")
  const [isVentaDialogOpen, setIsVentaDialogOpen] = useState(false)
  const [isCancelacionDialogOpen, setIsCancelacionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newVenta, setNewVenta] = useState({
    rncCedula: "",
    tipoComprobante: "",
    ncf: "",
    fecha: "",
    cliente: "",
    montoGravado: "",
    itbis: "",
  })
  const [newCancelacion, setNewCancelacion] = useState({
    ncfModificado: "",
    tipoComprobante: "",
    ncfCancelacion: "",
    fecha: "",
    motivo: "",
  })

  useEffect(() => {
    loadVentas()
  }, [periodo])

  const loadVentas = async () => {
    try {
      setIsLoading(true)
      const empresaId = "00000000-0000-0000-0000-000000000000" // TODO: Get from auth
      const data = await impuestosService.getReportes607(empresaId, periodo)

      const ventasFormateadas = data.map((r: any) => ({
        id: r.id,
        rncCedula: r.rnc_cedula,
        tipoComprobante: r.tipo_comprobante,
        ncf: r.ncf,
        fecha: r.fecha,
        cliente: r.cliente,
        montoGravado: r.monto_gravado,
        itbis: r.itbis,
        total: r.total,
      }))

      setVentas(ventasFormateadas)
    } catch (error) {
      console.error("[v0] Error loading ventas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVenta = async () => {
    try {
      const montoGravado = Number.parseFloat(newVenta.montoGravado) || 0
      const itbis = Number.parseFloat(newVenta.itbis) || 0

      const empresaId = "00000000-0000-0000-0000-000000000000" // TODO: Get from auth

      await impuestosService.createReporte607(empresaId, {
        rnc_cedula: newVenta.rncCedula,
        tipo_comprobante: newVenta.tipoComprobante,
        ncf: newVenta.ncf,
        fecha: newVenta.fecha,
        cliente: newVenta.cliente,
        monto_gravado: montoGravado,
        itbis: itbis,
      })

      await loadVentas()

      setIsVentaDialogOpen(false)
      setNewVenta({
        rncCedula: "",
        tipoComprobante: "",
        ncf: "",
        fecha: "",
        cliente: "",
        montoGravado: "",
        itbis: "",
      })
    } catch (error) {
      console.error("[v0] Error adding venta:", error)
    }
  }

  const handleDeleteVenta = async (ventaId: string) => {
    try {
      const empresaId = "00000000-0000-0000-0000-000000000000" // TODO: Get from auth
      await impuestosService.deleteReporte607(ventaId, empresaId)
      await loadVentas()
    } catch (error) {
      console.error("[v0] Error deleting venta:", error)
    }
  }

  const filteredVentas = ventas.filter(
    (venta) =>
      venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.rncCedula.includes(searchTerm) ||
      venta.ncf.includes(searchTerm),
  )

  const totalMontoGravado = ventas.reduce((sum, v) => sum + v.montoGravado, 0)
  const totalITBIS = ventas.reduce((sum, v) => sum + v.itbis, 0)
  const totalGeneral = ventas.reduce((sum, v) => sum + v.total, 0)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Formulario 607</h1>
                <p className="text-muted-foreground">Declaración Informativa de Ventas</p>
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

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ventas.length}</div>
                  <p className="text-xs text-muted-foreground">Registros</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monto Gravado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalMontoGravado.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Base imponible</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ITBIS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalITBIS.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total impuesto</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalGeneral.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Incluye ITBIS</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="ventas" className="space-y-4">
              <TabsList>
                <TabsTrigger value="ventas">Ventas</TabsTrigger>
                <TabsTrigger value="cancelaciones">Cancelaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="ventas" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Detalle de Ventas</CardTitle>
                        <CardDescription>Registro de todas las ventas del período</CardDescription>
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
                        <Button onClick={() => setIsVentaDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Venta
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <p className="text-muted-foreground">Cargando ventas...</p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="p-3 text-left text-sm font-medium">RNC/Cédula</th>
                                <th className="p-3 text-left text-sm font-medium">Tipo</th>
                                <th className="p-3 text-left text-sm font-medium">NCF</th>
                                <th className="p-3 text-left text-sm font-medium">Fecha</th>
                                <th className="p-3 text-left text-sm font-medium">Cliente</th>
                                <th className="p-3 text-right text-sm font-medium">Monto Gravado</th>
                                <th className="p-3 text-right text-sm font-medium">ITBIS</th>
                                <th className="p-3 text-right text-sm font-semibold">Total</th>
                                <th className="p-3 text-center text-sm font-medium">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredVentas.map((venta) => (
                                <tr key={venta.id} className="border-b hover:bg-muted/50">
                                  <td className="p-3 text-sm font-mono">{venta.rncCedula}</td>
                                  <td className="p-3 text-sm">
                                    <Badge variant="outline">{venta.tipoComprobante}</Badge>
                                  </td>
                                  <td className="p-3 text-sm font-mono">{venta.ncf}</td>
                                  <td className="p-3 text-sm">{new Date(venta.fecha).toLocaleDateString()}</td>
                                  <td className="p-3 text-sm">{venta.cliente}</td>
                                  <td className="p-3 text-right text-sm">RD$ {venta.montoGravado.toLocaleString()}</td>
                                  <td className="p-3 text-right text-sm font-medium">
                                    RD$ {venta.itbis.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-right text-sm font-semibold">
                                    RD$ {venta.total.toLocaleString()}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button variant="ghost" size="icon" onClick={() => handleDeleteVenta(venta.id)}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-muted font-semibold">
                                <td colSpan={5} className="p-3 text-sm">
                                  TOTALES
                                </td>
                                <td className="p-3 text-right text-sm">RD$ {totalMontoGravado.toLocaleString()}</td>
                                <td className="p-3 text-right text-sm">RD$ {totalITBIS.toLocaleString()}</td>
                                <td className="p-3 text-right text-sm">RD$ {totalGeneral.toLocaleString()}</td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cancelaciones" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Cancelaciones y Anulaciones</CardTitle>
                        <CardDescription>Registro de NCF cancelados o anulados</CardDescription>
                      </div>
                      <Button onClick={() => setIsCancelacionDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Cancelación
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="p-3 text-left text-sm font-medium">NCF Modificado</th>
                              <th className="p-3 text-left text-sm font-medium">Tipo</th>
                              <th className="p-3 text-left text-sm font-medium">NCF Cancelación</th>
                              <th className="p-3 text-left text-sm font-medium">Fecha</th>
                              <th className="p-3 text-left text-sm font-medium">Motivo</th>
                              <th className="p-3 text-center text-sm font-medium">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cancelaciones.map((cancelacion) => (
                              <tr key={cancelacion.id} className="border-b hover:bg-muted/50">
                                <td className="p-3 text-sm font-mono">{cancelacion.ncfModificado}</td>
                                <td className="p-3 text-sm">
                                  <Badge variant="outline">{cancelacion.tipoComprobante}</Badge>
                                </td>
                                <td className="p-3 text-sm font-mono">{cancelacion.ncfCancelacion}</td>
                                <td className="p-3 text-sm">{new Date(cancelacion.fecha).toLocaleDateString()}</td>
                                <td className="p-3 text-sm">{cancelacion.motivo}</td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

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

      <Dialog open={isVentaDialogOpen} onOpenChange={setIsVentaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Venta</DialogTitle>
            <DialogDescription>Ingrese los datos de la venta para el formulario 607</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rncCedula">RNC/Cédula del Cliente</Label>
                <Input
                  id="rncCedula"
                  placeholder="40212345678"
                  value={newVenta.rncCedula}
                  onChange={(e) => setNewVenta({ ...newVenta, rncCedula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoComprobante">Tipo de Comprobante</Label>
                <Input
                  id="tipoComprobante"
                  placeholder="01"
                  value={newVenta.tipoComprobante}
                  onChange={(e) => setNewVenta({ ...newVenta, tipoComprobante: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ncf">NCF</Label>
                <Input
                  id="ncf"
                  placeholder="B0100000001"
                  value={newVenta.ncf}
                  onChange={(e) => setNewVenta({ ...newVenta, ncf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={newVenta.fecha}
                  onChange={(e) => setNewVenta({ ...newVenta, fecha: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente">Nombre del Cliente</Label>
              <Input
                id="cliente"
                placeholder="Juan Pérez"
                value={newVenta.cliente}
                onChange={(e) => setNewVenta({ ...newVenta, cliente: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montoGravado">Monto Gravado</Label>
                <Input
                  id="montoGravado"
                  type="number"
                  placeholder="25000"
                  value={newVenta.montoGravado}
                  onChange={(e) => setNewVenta({ ...newVenta, montoGravado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itbis">ITBIS</Label>
                <Input
                  id="itbis"
                  type="number"
                  placeholder="4500"
                  value={newVenta.itbis}
                  onChange={(e) => setNewVenta({ ...newVenta, itbis: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVentaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddVenta}>Agregar Venta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelacionDialogOpen} onOpenChange={setIsCancelacionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Cancelación</DialogTitle>
            <DialogDescription>Ingrese los datos de la cancelación o anulación de NCF</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ncfModificado">NCF Modificado</Label>
                <Input
                  id="ncfModificado"
                  placeholder="B0100000005"
                  value={newCancelacion.ncfModificado}
                  onChange={(e) => setNewCancelacion({ ...newCancelacion, ncfModificado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoComprobanteCancelacion">Tipo de Comprobante</Label>
                <Input
                  id="tipoComprobanteCancelacion"
                  placeholder="04"
                  value={newCancelacion.tipoComprobante}
                  onChange={(e) => setNewCancelacion({ ...newCancelacion, tipoComprobante: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ncfCancelacion">NCF de Cancelación</Label>
                <Input
                  id="ncfCancelacion"
                  placeholder="B0400000001"
                  value={newCancelacion.ncfCancelacion}
                  onChange={(e) => setNewCancelacion({ ...newCancelacion, ncfCancelacion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaCancelacion">Fecha</Label>
                <Input
                  id="fechaCancelacion"
                  type="date"
                  value={newCancelacion.fecha}
                  onChange={(e) => setNewCancelacion({ ...newCancelacion, fecha: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de Cancelación</Label>
              <Input
                id="motivo"
                placeholder="Error en facturación"
                value={newCancelacion.motivo}
                onChange={(e) => setNewCancelacion({ ...newCancelacion, motivo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelacionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsCancelacionDialogOpen(false)}>Agregar Cancelación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
