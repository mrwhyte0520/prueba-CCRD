"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, DollarSign, Trash2, Loader2 } from "lucide-react"
import * as cobrosService from "@/lib/services/cobros.service"
import * as clientesService from "@/lib/services/clientes.service"
import * as cuentasPorCobrarService from "@/lib/services/cuentas-cobrar.service"
import type { Cobro } from "@/lib/services/cobros.service"
import { toast } from "sonner"
import type { CuentaPorCobrar} from "@/lib/services/cuentas-cobrar.service"


interface FacturaPendiente {
  id: string
  numero_factura: string
  fecha_factura: string
  balance: number
  estado: string
}

interface ItemCobro {
  cuenta_cobrar_id: string
  monto_aplicado: number
}

interface Cliente {
  id: string
  nombre: string
  balance?: number
}

interface FormData {
  fecha: string
  metodo_pago: string
  referencia: string
  monto: number
}

export default function CobrosPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState("")
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [facturasCliente, setFacturasCliente] = useState<FacturaPendiente[]>([])
  const [itemsCobro, setItemsCobro] = useState<ItemCobro[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
const EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
  const [formData, setFormData] = useState<FormData>({
    fecha: new Date().toISOString().split("T")[0],
    metodo_pago: "",
    referencia: "",
    monto: 0,
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  // Cargar facturas al seleccionar cliente
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
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos.")
    } finally {
      setLoading(false)
    }
  }

  const loadFacturasCliente = async (clienteId: string) => {
  try {
    const facturas = await cuentasPorCobrarService.getCuentasPorCobrarByCliente(EMPRESA_ID, clienteId)

    const normalizadas: FacturaPendiente[] = facturas.map((f: any) => ({
      id: f.id,
      numero_factura: f.factura_numero, // 🔁 renombrar
      fecha_factura: f.fecha, // 🔁 renombrar
      balance: f.balance,
      estado: f.estado,
    }))

    setFacturasCliente(normalizadas.filter((f) => f.estado !== "pagada"))
  } catch (error) {
    console.error("Error al cargar facturas:", error)
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
      setItemsCobro([...itemsCobro, { cuenta_cobrar_id: facturaId, monto_aplicado: monto }])
    }
  }

  const eliminarItem = (facturaId: string) => {
    setItemsCobro(itemsCobro.filter((item) => item.cuenta_cobrar_id !== facturaId))
  }

  const montoTotal = useMemo(
    () => itemsCobro.reduce((sum, item) => sum + item.monto_aplicado, 0),
    [itemsCobro]
  )

  const guardarCobro = async () => {
    if (!clienteSeleccionado || itemsCobro.length === 0 || !formData.metodo_pago) {
      toast.error("Complete todos los campos y agregue al menos una factura.")
      return
    }

    try {
      setSaving(true)
      await cobrosService.createCobro({
        cliente_id: clienteSeleccionado,
        fecha: formData.fecha,
        monto: montoTotal,
        metodo_pago: formData.metodo_pago,
        referencia: formData.referencia,
      })

      toast.success("Cobro registrado exitosamente.")
      setDialogAbierto(false)
      setClienteSeleccionado("")
      setItemsCobro([])
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        metodo_pago: "",
        referencia: "",
        monto: 0,
      })
      loadData()
    } catch (error) {
      console.error("Error al registrar el cobro:", error)
      toast.error("Error al registrar el cobro.")
    } finally {
      setSaving(false)
    }
  }

  // Filtrar cobros del día y del mes
  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const añoActual = hoy.getFullYear()

  const cobrosDelDia = cobros.filter((c) => c.fecha === hoy.toISOString().split("T")[0])
  const cobrosDelMes = cobros.filter((c) => {
    const fecha = new Date(c.fecha)
    return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual
  })

  const totalDelDia = cobrosDelDia.reduce((sum, c) => sum + (c.monto || 0), 0)
  const totalDelMes = cobrosDelMes.reduce((sum, c) => sum + (c.monto || 0), 0)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Cargando cobros...
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Cobros</h1>
              <p className="text-muted-foreground">Registro de cobros a clientes</p>
            </div>

            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Registrar Cobro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Cobro</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {/* Cliente + Fecha */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select
                        value={clienteSeleccionado}
                        onValueChange={setClienteSeleccionado}
                      >
                        <SelectTrigger>
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
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={formData.fecha}
                        onChange={(e) =>
                          setFormData({ ...formData, fecha: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Facturas pendientes */}
                  {clienteSeleccionado && (
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium mb-2">Facturas Pendientes</div>
                      <div className="text-2xl font-bold text-warning">
                        {facturasCliente.length} facturas
                      </div>
                    </div>
                  )}

                  {/* Tabla de facturas */}
                  <div className="rounded-lg border max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Factura</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead className="text-right">Monto a Cobrar</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facturasCliente.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              {clienteSeleccionado
                                ? "No hay facturas pendientes"
                                : "Seleccione un cliente"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          facturasCliente.map((factura) => (
                            <TableRow key={factura.id}>
                              <TableCell>{factura.numero_factura}</TableCell>
                              <TableCell>
                                {new Date(factura.fecha_factura).toLocaleDateString("es-DO")}
                              </TableCell>
                              <TableCell className="text-right">
                                RD$ {factura.balance.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-28"
                                  max={factura.balance}
                                  onChange={(e) =>
                                    agregarFactura(factura.id, Number(e.target.value) || 0)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {itemsCobro.some(
                                  (item) => item.cuenta_cobrar_id === factura.id
                                ) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => eliminarItem(factura.id)}
                                    aria-label="Eliminar factura del cobro"
                                  >
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

                  {/* Método de pago */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <Select
                        value={formData.metodo_pago}
                        onValueChange={(v) =>
                          setFormData({ ...formData, metodo_pago: v })
                        }
                      >
                        <SelectTrigger>
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
                      <Label>Referencia</Label>
                      <Input
                        placeholder="Número de referencia"
                        value={formData.referencia}
                        onChange={(e) =>
                          setFormData({ ...formData, referencia: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Monto total */}
                  <div className="space-y-2">
                    <Label>Monto Total</Label>
                    <Input
                      type="number"
                      readOnly
                      value={montoTotal}
                      className="text-lg font-semibold"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={guardarCobro} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Registrar Cobro
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Métricas */}
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-sm text-muted-foreground">Cobros del Día</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RD$ {totalDelDia.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{cobrosDelDia.length} cobros</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-sm text-muted-foreground">Cobros del Mes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RD$ {totalDelMes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{cobrosDelMes.length} cobros</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
  }