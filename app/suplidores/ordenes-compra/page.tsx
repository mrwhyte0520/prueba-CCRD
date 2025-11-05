"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as ordenesCompraService from "@/lib/services/ordenes-compra.service"
import * as suplidoresService from "@/lib/services/suplidores.service"
import * as productosService from "@/lib/services/productos.service"
import { Plus, Eye, FileText, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

export default function OrdenesCompraPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ordenesCompra, setOrdenesCompra] = useState<any[]>([])
  const [suplidores, setSuplidores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [selectedSuplidor, setSelectedSuplidor] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])
  const [items, setItems] = useState<any[]>([])
  const [selectedProducto, setSelectedProducto] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [precio, setPrecio] = useState("")
  const [observaciones, setObservaciones] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordenesData, suplidoresData, productosData] = await Promise.all([
        ordenesCompraService.getAll(),
        suplidoresService.getAll(),
        productosService.getAll(),
      ])
      setOrdenesCompra(ordenesData)
      setSuplidores(suplidoresData)
      setProductos(productosData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const agregarItem = () => {
    if (!selectedProducto || !cantidad || !precio) return

    const producto = productos.find((p) => p.id === selectedProducto)
    if (!producto) return

    const nuevoItem = {
      producto_id: selectedProducto,
      producto_nombre: producto.nombre,
      cantidad: Number.parseFloat(cantidad),
      precio_unitario: Number.parseFloat(precio),
      subtotal: Number.parseFloat(cantidad) * Number.parseFloat(precio),
    }

    setItems([...items, nuevoItem])
    setSelectedProducto("")
    setCantidad("")
    setPrecio("")
  }

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const itbis = subtotal * 0.18
    const total = subtotal + itbis
    return { subtotal, itbis, total }
  }

  const crearOrden = async () => {
    if (!selectedSuplidor || items.length === 0) {
      alert("Debe seleccionar un suplidor y agregar al menos un producto")
      return
    }

    try {
      const { total } = calcularTotales()
      await ordenesCompraService.create({
        suplidor_id: selectedSuplidor,
        fecha,
        total,
        estado: "pendiente",
        observaciones,
        items,
      })

      setDialogAbierto(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Error al crear la orden de compra")
    }
  }

  const resetForm = () => {
    setSelectedSuplidor("")
    setFecha(new Date().toISOString().split("T")[0])
    setItems([])
    setObservaciones("")
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>
      case "aprobada":
        return <Badge className="bg-primary text-primary-foreground">Aprobada</Badge>
      case "recibida":
        return <Badge className="bg-success text-success-foreground">Recibida</Badge>
      case "anulada":
        return <Badge variant="destructive">Anulada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const { subtotal, itbis, total } = calcularTotales()

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando órdenes de compra...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Órdenes de Compra</h1>
              <p className="text-muted-foreground">Gestión de órdenes de compra a suplidores</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Orden
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Nueva Orden de Compra</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="suplidor">Suplidor</Label>
                      <Select value={selectedSuplidor} onValueChange={setSelectedSuplidor}>
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
                      <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Productos</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedProducto}
                        onValueChange={(value) => {
                          setSelectedProducto(value)
                          const producto = productos.find((p) => p.id === value)
                          if (producto) setPrecio(producto.costo.toString())
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((producto) => (
                            <SelectItem key={producto.id} value={producto.id}>
                              {producto.nombre} - RD$ {producto.costo.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        className="w-24"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Precio"
                        className="w-32"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                      />
                      <Button onClick={agregarItem}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                No hay productos agregados
                              </TableCell>
                            </TableRow>
                          ) : (
                            items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.producto_nombre}</TableCell>
                                <TableCell className="text-right">{item.cantidad}</TableCell>
                                <TableCell className="text-right">
                                  RD$ {item.precio_unitario.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">RD$ {item.subtotal.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => eliminarItem(index)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <textarea
                      id="observaciones"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Observaciones adicionales..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">RD$ {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">ITBIS (18%):</span>
                      <span className="font-medium">RD$ {itbis.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="text-lg font-bold text-primary">RD$ {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogAbierto(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={crearOrden}>Crear Orden</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Órdenes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ordenesCompra.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {ordenesCompra.filter((o) => o.estado === "pendiente").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Por aprobar</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aprobadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {ordenesCompra.filter((o) => o.estado === "aprobada").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">En proceso</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RD$ {ordenesCompra.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Este mes</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Órdenes de Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Suplidor</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenesCompra.map((orden) => (
                    <TableRow key={orden.id}>
                      <TableCell className="font-mono text-sm">{orden.numero}</TableCell>
                      <TableCell>{new Date(orden.fecha).toLocaleDateString("es-DO")}</TableCell>
                      <TableCell className="font-medium">{orden.suplidor_nombre || "N/A"}</TableCell>
                      <TableCell className="text-right font-medium">RD$ {orden.total.toLocaleString()}</TableCell>
                      <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
