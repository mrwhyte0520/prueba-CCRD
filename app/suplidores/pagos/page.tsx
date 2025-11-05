"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, DollarSign, Trash2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as pagosService from "@/lib/services/pagos.service"
import * as suplidoresService from "@/lib/services/suplidores.service"
import * as cuentasPagarService from "@/lib/services/cuentas-pagar.service"

export default function PagosPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [suplidorSeleccionado, setSuplidorSeleccionado] = useState("")
  const [pagos, setPagos] = useState<any[]>([])
  const [suplidores, setSuplidores] = useState<any[]>([])
  const [ordenesSupl, setOrdenesSupl] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsPago, setItemsPago] = useState<any[]>([])
const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    metodo_pago: "",
    referencia: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (suplidorSeleccionado) {
      loadOrdenesSuplidor(suplidorSeleccionado)
    } else {
      setOrdenesSupl([])
      setItemsPago([])
    }
  }, [suplidorSeleccionado])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pagosData, suplidoresData] = await Promise.all([
        pagosService.getAllPagos(),
        suplidoresService.getAllSuplidores(),
      ])
      setPagos(pagosData)
      setSuplidores(suplidoresData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrdenesSuplidor = async (suplidorId: string) => {
    try {
      const ordenes = await cuentasPagarService.getCuentasPorPagarBySuplidor(suplidorId,empresaId)
      setOrdenesSupl(ordenes.filter((o) => o.estado !== "pagada"))
    } catch (error) {
      console.error("[v0] Error loading ordenes:", error)
    }
  }

  const agregarOrden = (ordenId: string, monto: number) => {
    const orden = ordenesSupl.find((o) => o.id === ordenId)
    if (!orden || monto <= 0 || monto > orden.balance) return

    const existingIndex = itemsPago.findIndex((item) => item.cuenta_pagar_id === ordenId)
    if (existingIndex >= 0) {
      const newItems = [...itemsPago]
      newItems[existingIndex].monto_aplicado = monto
      setItemsPago(newItems)
    } else {
      setItemsPago([
        ...itemsPago,
        {
          cuenta_pagar_id: ordenId,
          monto_aplicado: monto,
        },
      ])
    }
  }

  const eliminarItem = (ordenId: string) => {
    setItemsPago(itemsPago.filter((item) => item.cuenta_pagar_id !== ordenId))
  }

  const guardarPago = async () => {
    if (!suplidorSeleccionado || itemsPago.length === 0 || !formData.metodo_pago) {
      alert("Por favor complete todos los campos y agregue al menos una orden")
      return
    }

    const montoTotal = itemsPago.reduce((sum, item) => sum + item.monto_aplicado, 0)

    try {
      await pagosService.createPago({
         suplidor_id: suplidorSeleccionado,
  fecha: formData.fecha,
  monto: montoTotal, // <- renombrar a "monto"
  metodo_pago: formData.metodo_pago,
  referencia: formData.referencia,
 
      })

      alert("Pago registrado exitosamente")
      setDialogAbierto(false)
      setSuplidorSeleccionado("")
      setItemsPago([])
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        metodo_pago: "",
        referencia: "",
      })
      loadData()
    } catch (error) {
      console.error("[v0] Error saving pago:", error)
      alert("Error al registrar el pago")
    }
  }

  const pagosDelDia = pagos.filter((p) => p.fecha === new Date().toISOString().split("T")[0])
  const totalDelDia = pagosDelDia.reduce((sum, p) => sum + (p.monto_total || 0), 0)
  const totalDelMes = pagos.reduce((sum, p) => sum + (p.monto_total || 0), 0)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Pagos a Suplidores</h1>
              <p className="text-muted-foreground">Registro de pagos realizados</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Pago
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Pago a Suplidor</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="suplidor">Suplidor</Label>
                      <Select value={suplidorSeleccionado} onValueChange={setSuplidorSeleccionado}>
                        <SelectTrigger id="suplidor">
                          <SelectValue placeholder="Seleccionar suplidor" />
                        </SelectTrigger>
                        <SelectContent>
                          {suplidores.map((suplidor) => (
                            <SelectItem key={suplidor.id} value={suplidor.id}>
                              {suplidor.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      />
                    </div>
                  </div>

                  {suplidorSeleccionado && (
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium mb-2">Órdenes Pendientes</div>
                      <div className="text-2xl font-bold text-destructive">{ordenesSupl.length} órdenes</div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Órdenes Pendientes</Label>
                    <div className="rounded-lg border max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Orden</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Monto a Pagar</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!suplidorSeleccionado || ordenesSupl.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                {!suplidorSeleccionado ? "Seleccione un suplidor" : "No hay órdenes pendientes"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            ordenesSupl.map((orden) => (
                              <TableRow key={orden.id}>
                                <TableCell className="font-mono text-sm">
                                  {orden.ordenes_compra?.numero_orden}
                                </TableCell>
                                <TableCell>
                                  {orden.fecha_orden ? new Date(orden.fecha_orden).toLocaleDateString("es-DO") : "N/A"}
                                </TableCell>
                                <TableCell className="text-right">
                                  RD$ {(orden.balance || 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-32"
                                    max={orden.balance}
                                    onChange={(e) => agregarOrden(orden.id, Number.parseFloat(e.target.value) || 0)}
                                  />
                                </TableCell>
                                <TableCell>
                                  {itemsPago.some((item) => item.cuenta_pagar_id === orden.id) && (
                                    <Button variant="ghost" size="icon" onClick={() => eliminarItem(orden.id)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="metodo-pago">Método de Pago</Label>
                      <Select
                        value={formData.metodo_pago}
                        onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}
                      >
                        <SelectTrigger id="metodo-pago">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referencia">Referencia</Label>
                      <Input
                        id="referencia"
                        placeholder="Número de referencia"
                        value={formData.referencia}
                        onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monto-total">Monto Total del Pago</Label>
                    <Input
                      id="monto-total"
                      type="number"
                      placeholder="0.00"
                      className="text-lg font-semibold"
                      value={itemsPago.reduce((sum, item) => sum + item.monto_aplicado, 0)}
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarPago}>Registrar Pago</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pagos del Día</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RD$ {totalDelDia.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{pagosDelDia.length} pagos realizados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pagos del Mes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RD$ {totalDelMes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{pagos.length} pagos realizados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Promedio por Pago</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RD$ {pagos.length > 0 ? Math.round(totalDelMes / pagos.length).toLocaleString() : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Basado en pagos del mes</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pagos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Suplidor</TableHead>
                      <TableHead>Órdenes</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No hay pagos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagos.slice(0, 10).map((pago) => (
                        <TableRow key={pago.id}>
                          <TableCell className="font-mono text-sm">{pago.numero_pago}</TableCell>
                          <TableCell>{new Date(pago.fecha).toLocaleDateString("es-DO")}</TableCell>
                          <TableCell className="font-medium">{pago.suplidores?.nombre || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">{pago.pagos_items?.length || 0} orden(es)</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            RD$ {(pago.monto_total || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>{pago.metodo_pago}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
