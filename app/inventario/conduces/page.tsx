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
import { Plus, Eye, FileText, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as conducesService from "@/lib/services/conduces.service"
import * as almacenesService from "@/lib/services/almacenes.service"
import * as productosService from "@/lib/services/productos.service"

export default function ConducesPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [conduces, setConduces] = useState<any[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState("")
  const [cantidad, setCantidad] = useState(1)

  const [formData, setFormData] = useState({
    almacen_origen_id: "",
    almacen_destino_id: "",
    fecha: new Date().toISOString().split("T")[0],
    observaciones: "",
  })
  const DEFAULT_EMPRESA_ID = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501";

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [conducesData, almacenesData, productosData] = await Promise.all([
        conducesService.getAllConduces(),
        almacenesService.getAllAlmacenes(),
        productosService.getAllProductos(),
      ])
      setConduces(conducesData)
      setAlmacenes(almacenesData)
      setProductos(productosData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return

    const producto = productos.find((p) => p.id === productoSeleccionado)
    if (!producto) return

    setItems([
      ...items,
      {
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        cantidad,
      },
    ])
    setProductoSeleccionado("")
    setCantidad(1)
  }

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const guardarConduce = async () => {
    if (!formData.almacen_origen_id || !formData.almacen_destino_id || items.length === 0) {
      alert("Por favor complete todos los campos y agregue al menos un producto")
      return
    }

    if (formData.almacen_origen_id === formData.almacen_destino_id) {
      alert("El almacén origen y destino no pueden ser el mismo")
      return
    }

    try {
      const numero = await conducesService.getNextConduceNumero(DEFAULT_EMPRESA_ID);
    await conducesService.createConduce(DEFAULT_EMPRESA_ID, {
  numero,
  fecha: formData.fecha,
  almacen_origen_id: formData.almacen_origen_id,
  almacen_destino_id: formData.almacen_destino_id,
  notas: formData.observaciones,
  items: items.map((item) => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad,
  })),
      })

      alert("Conduce creado exitosamente")
      setDialogAbierto(false)
      setFormData({
        almacen_origen_id: "",
        almacen_destino_id: "",
        fecha: new Date().toISOString().split("T")[0],
        observaciones: "",
      })
      setItems([])
      loadData()
    } catch (error) {
      console.error("[v0] Error saving conduce:", error)
      alert("Error al crear el conduce")
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return <Badge className="bg-success text-success-foreground">Completado</Badge>
      case "pendiente":
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>
      case "anulado":
        return <Badge variant="destructive">Anulado</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Conduces de Entrega</h1>
              <p className="text-muted-foreground">Gestión de traslados entre almacenes</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Conduce
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Conduce de Entrega</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="almacen-origen">Almacén Origen</Label>
                      <Select
                        value={formData.almacen_origen_id}
                        onValueChange={(value) => setFormData({ ...formData, almacen_origen_id: value })}
                      >
                        <SelectTrigger id="almacen-origen">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {almacenes.map((almacen) => (
                            <SelectItem key={almacen.id} value={almacen.id}>
                              {almacen.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="almacen-destino">Almacén Destino</Label>
                      <Select
                        value={formData.almacen_destino_id}
                        onValueChange={(value) => setFormData({ ...formData, almacen_destino_id: value })}
                      >
                        <SelectTrigger id="almacen-destino">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {almacenes.map((almacen) => (
                            <SelectItem key={almacen.id} value={almacen.id}>
                              {almacen.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  <div className="space-y-4">
                    <Label>Productos a Trasladar</Label>
                    <div className="flex gap-2">
                      <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((producto) => (
                            <SelectItem key={producto.id} value={producto.id}>
                              {producto.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        className="w-24"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number.parseInt(e.target.value))}
                      />
                      <Button onClick={agregarProducto}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                                No hay productos agregados
                              </TableCell>
                            </TableRow>
                          ) : (
                            items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.producto_nombre}</TableCell>
                                <TableCell className="text-right">{item.cantidad}</TableCell>
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
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarConduce}>Crear Conduce</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Conduces</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Cargando conduces...
                      </TableCell>
                    </TableRow>
                  ) : conduces.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No hay conduces registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    conduces.map((conduce) => (
                      <TableRow key={conduce.id}>
                        <TableCell className="font-mono text-sm">{conduce.numero}</TableCell>
                        <TableCell>{new Date(conduce.fecha).toLocaleDateString("es-DO")}</TableCell>
                        <TableCell>{conduce.almacen_origen?.nombre || "N/A"}</TableCell>
                        <TableCell>{conduce.almacen_destino?.nombre || "N/A"}</TableCell>
                        <TableCell className="text-right">{conduce.items?.length || 0}</TableCell>
                        <TableCell>{getEstadoBadge(conduce.estado)}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
