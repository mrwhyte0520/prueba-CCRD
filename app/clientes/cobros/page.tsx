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
import * as cobrosService from "@/lib/services/cobros.service"
import * as clientesService from "@/lib/services/clientes.service"
import * as cuentasCobrarService from "@/lib/services/cuentas-cobrar.service"

export default function CobrosPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState("")
  const [cobros, setCobros] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [facturasCliente, setFacturasCliente] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsCobro, setItemsCobro] = useState<any[]>([])

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    metodo_pago: "",
    referencia: "",
    monto_total: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (clienteSeleccionado) {
      loadFacturasCliente(clienteSeleccionado)
    } else {
      setFacturasCliente([])
      setItemsCobro([])
    }
  }, [clienteSeleccionado])

  const loadData = async () => {
    try {
      setLoading(true)
      const [cobrosData, clientesData] = await Promise.all([
        cobrosService.getAllCobros(),
        clientesService.getAllClientes(),
      ])
      setCobros(cobrosData)
      setClientes(clientesData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFacturasCliente = async (clienteId: string) => {
    try {
      const facturas = await cuentasCobrarService.getCuentasCobrarByCliente(clienteId)
      setFacturasCliente(facturas.filter((f) => f.estado !== "pagada"))
    } catch (error) {
      console.error("[v0] Error loading facturas:", error)
    }
  }

  const agregarFactura = (facturaId: string, monto: number) => {
    const factura = facturasCliente.find((f) => f.id === facturaId)
    if (!factura || monto <= 0 || monto > factura.balance) return

    const existingIndex = itemsCobro.findIndex((item) => item.cuenta_cobrar_id === facturaId)
    if (existingIndex >= 0) {
      const newItems = [...itemsCobro]
      newItems[existingIndex].monto_aplicado = monto
      setItemsCobro(newItems)
    } else {
      setItemsCobro([
        ...itemsCobro,
        {
          cuenta_cobrar_id: facturaId,
          monto_aplicado: monto,
        },
      ])
    }
  }

  const eliminarItem = (facturaId: string) => {
    setItemsCobro(itemsCobro.filter((item) => item.cuenta_cobrar_id !== facturaId))
  }

  const guardarCobro = async () => {
    if (!clienteSeleccionado || itemsCobro.length === 0 || !formData.metodo_pago) {
      alert("Por favor complete todos los campos y agregue al menos una factura")
      return
    }

    const montoTotal = itemsCobro.reduce((sum, item) => sum + item.monto_aplicado, 0)

    try {
      await cobrosService.createCobro({
        cliente_id: clienteSeleccionado,
        fecha: formData.fecha,
        monto_total: montoTotal,
        metodo_pago: formData.metodo_pago,
        referencia: formData.referencia,
        items: itemsCobro,
      })

      alert("Cobro registrado exitosamente")
      setDialogAbierto(false)
      setClienteSeleccionado("")
      setItemsCobro([])
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        metodo_pago: "",
        referencia: "",
        monto_total: 0,
      })
      loadData()
    } catch (error) {
      console.error("[v0] Error saving cobro:", error)
      alert("Error al registrar el cobro")
    }
  }

  const clienteBalance = clientes.find((c) => c.id === clienteSeleccionado)?.balance || 0
  const cobrosDelDia = cobros.filter((c) => c.fecha === new Date().toISOString().split("T")[0])
  const totalDelDia = cobrosDelDia.reduce((sum, c) => sum + (c.monto_total || 0), 0)
  const totalDelMes = cobros.reduce((sum, c) => sum + (c.monto_total || 0), 0)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Cobros</h1>
              <p className="text-muted-foreground">Registro de cobros a clientes</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Cobro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Cobro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cliente">Cliente</Label>
                      <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
                        <SelectTrigger id="cliente">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nombre}
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

                  {clienteSeleccionado && (
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium mb-2">Facturas Pendientes</div>
                      <div className="text-2xl font-bold text-warning">{facturasCliente.length} facturas</div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Facturas Pendientes</Label>
                    <div className="rounded-lg border max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Factura</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Monto a Cobrar</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!clienteSeleccionado || facturasCliente.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                {!clienteSeleccionado ? "Seleccione un cliente" : "No hay facturas pendientes"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            facturasCliente.map((factura) => (
                              <TableRow key={factura.id}>
                                <TableCell className="font-mono text-sm">{factura.facturas?.numero_factura}</TableCell>
                                <TableCell>
                                  {factura.fecha_factura
                                    ? new Date(factura.fecha_factura).toLocaleDateString("es-DO")
                                    : "N/A"}
                                </TableCell>
                                <TableCell className="text-right">
                                  RD$ {(factura.balance || 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-32"
                                    max={factura.balance}
                                    onChange={(e) => agregarFactura(factura.id, Number.parseFloat(e.target.value) || 0)}
                                  />
                                </TableCell>
                                <TableCell>
                                  {itemsCobro.some((item) => item.cuenta_cobrar_id === factura.id) && (
                                    <Button variant="ghost" size="icon" onClick={() => eliminarItem(factura.id)}>
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
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="tarjeta">Tarjeta</SelectItem>
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
                    <Label htmlFor="monto-total">Monto Total del Cobro</Label>
                    <Input
                      id="monto-total"
                      type="number"
                      placeholder="0.00"
                      className="text-lg font-semibold"
                      value={itemsCobro.reduce((sum, item) => sum + item.monto_aplicado, 0)}
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarCobro}>Registrar Cobro</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cobros del Día</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RD$ {totalDelDia.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{cobrosDelDia.length} cobros registrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cobros del Mes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RD$ {totalDelMes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{cobros.length} cobros registrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Promedio por Cobro</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RD$ {cobros.length > 0 ? Math.round(totalDelMes / cobros.length).toLocaleString() : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Basado en cobros del mes</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cobros Recientes</CardTitle>
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
                      <TableHead>Cliente</TableHead>
                      <TableHead>Facturas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cobros.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No hay cobros registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      cobros.slice(0, 10).map((cobro) => (
                        <TableRow key={cobro.id}>
                          <TableCell className="font-mono text-sm">{cobro.numero_cobro}</TableCell>
                          <TableCell>{new Date(cobro.fecha).toLocaleDateString("es-DO")}</TableCell>
                          <TableCell className="font-medium">{cobro.clientes?.nombre || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">{cobro.cobros_items?.length || 0} factura(s)</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            RD$ {(cobro.monto_total || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>{cobro.metodo_pago}</TableCell>
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
