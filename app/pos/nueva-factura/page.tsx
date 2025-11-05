"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect } from "react"
import { Plus, Trash2, Save, Printer, AlertCircle } from "lucide-react"
import { canCreateInvoiceToday, incrementDailyInvoiceCount, getRemainingDailyInvoices } from "@/lib/subscription"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import * as facturasService from "@/lib/services/facturas.service"
import * as productosService from "@/lib/services/productos.service"
import * as clientesService from "@/lib/services/clientes.service"

interface FacturaItem {
  productoId: string
  productoNombre: string
  cantidad: number
  precio: number
  itbis: number
  descuento: number
  total: number
}

export default function NuevaFacturaPage() {
  const [clienteId, setClienteId] = useState("")
  const [items, setItems] = useState<FacturaItem[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const [descuentoGlobal, setDescuentoGlobal] = useState(0)
  const [canCreateInvoice, setCanCreateInvoice] = useState(true)
  const [remainingInvoices, setRemainingInvoices] = useState<number | null>(null)
  const router = useRouter()
  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoNCF, setTipoNCF] = useState("")
  const [metodoPago, setMetodoPago] = useState("")
  const [referencia, setReferencia] = useState("")

  useEffect(() => {
    loadData()

    const canCreate = canCreateInvoiceToday()
    const remaining = getRemainingDailyInvoices()
    setCanCreateInvoice(canCreate)
    setRemainingInvoices(remaining)

    const productosPreseleccionados = localStorage.getItem("productosPreseleccionados")
    if (productosPreseleccionados) {
      try {
        const productos = JSON.parse(productosPreseleccionados)
        const nuevosItems: FacturaItem[] = productos.map((producto: any) => {
          const subtotal = producto.price * 1
          const itbis = producto.applies_itbis ? subtotal * 0.18 : 0
          const total = subtotal + itbis

          return {
            productoId: producto.id,
            productoNombre: producto.name,
            cantidad: 1,
            precio: producto.price,
            itbis,
            descuento: 0,
            total,
          }
        })
        setItems(nuevosItems)
        localStorage.removeItem("productosPreseleccionados")
      } catch (error) {
        console.error("Error loading preselected products:", error)
      }
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [clientesData, productosData] = await Promise.all([
        clientesService.getAllClientes(),
        productosService.getAllProductos(),
      ])
      setClientes(clientesData)
      setProductos(productosData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const agregarProducto = () => {
    if (!productoSeleccionado) return

    const producto = productos.find((p) => p.id === productoSeleccionado)
    if (!producto) return

    const subtotal = producto.precio_venta * cantidad
    const itbis = producto.aplica_itbis ? subtotal * 0.18 : 0
    const total = subtotal + itbis

    const nuevoItem: FacturaItem = {
      productoId: producto.id,
      productoNombre: producto.nombre,
      cantidad,
      precio: producto.precio_venta,
      itbis,
      descuento: 0,
      total,
    }

    setItems([...items, nuevoItem])
    setProductoSeleccionado("")
    setCantidad(1)
  }

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const totalItbis = items.reduce((sum, item) => sum + item.itbis, 0)
  const descuento = (subtotal * descuentoGlobal) / 100
  const total = subtotal + totalItbis - descuento

  const guardarFactura = async () => {
    if (!canCreateInvoiceToday()) {
      alert("Has alcanzado el límite de facturas diarias para tu plan. Actualiza tu plan para crear más facturas.")
      router.push("/planes")
      return
    }

    if (!clienteId || items.length === 0) {
      alert("Por favor seleccione un cliente y agregue productos")
      return
    }

    try {
      const facturaData = {
        cliente_id: clienteId,
        tipo_ncf: tipoNCF,
        subtotal,
        itbis: totalItbis,
        descuento,
        total,
        metodo_pago: metodoPago,
        referencia_pago: referencia,
        items: items.map((item) => ({
          producto_id: item.productoId,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          itbis: item.itbis,
          descuento: item.descuento,
          total: item.total,
        })),
      }

      await facturasService.createFactura(facturaData)
      incrementDailyInvoiceCount()

      alert("Factura guardada exitosamente")
      router.push("/pos/facturas")
    } catch (error) {
      console.error("[v0] Error saving factura:", error)
      alert("Error al guardar la factura")
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-balance">Nueva Factura</h1>
            <p className="text-muted-foreground">Crear una nueva factura de venta</p>
          </div>

          {!canCreateInvoice && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Límite de facturas alcanzado</AlertTitle>
              <AlertDescription>
                Has alcanzado el límite de 3 facturas diarias del plan Básico.
                <Button
                  variant="link"
                  className="h-auto p-0 ml-1 text-destructive underline"
                  onClick={() => router.push("/planes")}
                >
                  Actualiza tu plan
                </Button>{" "}
                para crear facturas ilimitadas.
              </AlertDescription>
            </Alert>
          )}

          {remainingInvoices !== null && remainingInvoices > 0 && (
            <Alert className="mb-6 border-amber-500 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Plan Básico:</strong> Te quedan {remainingInvoices}{" "}
                {remainingInvoices === 1 ? "factura" : "facturas"} disponibles hoy.
                <Button
                  variant="link"
                  className="h-auto p-0 ml-1 text-amber-800 underline"
                  onClick={() => router.push("/planes")}
                >
                  Ver planes
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cliente">Cliente</Label>
                      <Select value={clienteId} onValueChange={setClienteId} disabled={loading}>
                        <SelectTrigger id="cliente">
                          <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar cliente"} />
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
                      <Label htmlFor="ncf">NCF</Label>
                      <Select value={tipoNCF} onValueChange={setTipoNCF}>
                        <SelectTrigger id="ncf">
                          <SelectValue placeholder="Tipo de comprobante" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B01">B01 - Crédito Fiscal</SelectItem>
                          <SelectItem value="B02">B02 - Consumidor Final</SelectItem>
                          <SelectItem value="B14">B14 - Régimen Especial</SelectItem>
                          <SelectItem value="B15">B15 - Gubernamental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {clienteId && (
                    <div className="rounded-lg bg-muted p-4">
                      {(() => {
                        const cliente = clientes.find((c) => c.id === clienteId)
                        return cliente ? (
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">RNC:</span>
                              <span className="font-medium">{cliente.rnc || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Teléfono:</span>
                              <span className="font-medium">{cliente.telefono || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Balance:</span>
                              <span className="font-medium">RD$ {(cliente.balance || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agregar Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado} disabled={loading}>
                        <SelectTrigger>
                          <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar producto"} />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((producto) => (
                            <SelectItem key={producto.id} value={producto.id}>
                              {producto.nombre} - RD$ {producto.precio_venta?.toLocaleString() || 0}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                        placeholder="Cant."
                      />
                    </div>
                    <Button onClick={agregarProducto}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalle de Factura</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">ITBIS</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No hay productos agregados
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.productoNombre}</TableCell>
                            <TableCell className="text-right">{item.cantidad}</TableCell>
                            <TableCell className="text-right">RD$ {item.precio.toLocaleString()}</TableCell>
                            <TableCell className="text-right">RD$ {item.itbis.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">RD$ {item.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => eliminarItem(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">RD$ {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ITBIS (18%):</span>
                      <span className="font-medium">RD$ {totalItbis.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descuento">Descuento (%)</Label>
                      <Input
                        id="descuento"
                        type="number"
                        min="0"
                        max="100"
                        value={descuentoGlobal}
                        onChange={(e) => setDescuentoGlobal(Number(e.target.value))}
                      />
                    </div>
                    {descuento > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Descuento:</span>
                        <span className="font-medium text-success">- RD$ {descuento.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-lg font-bold text-primary">RD$ {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={guardarFactura}
                      disabled={items.length === 0 || !canCreateInvoice}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Factura
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={items.length === 0 || !canCreateInvoice}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Guardar e Imprimir
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metodo-pago">Método</Label>
                    <Select value={metodoPago} onValueChange={setMetodoPago}>
                      <SelectTrigger id="metodo-pago">
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referencia">Referencia</Label>
                    <Input
                      id="referencia"
                      placeholder="Número de referencia"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
