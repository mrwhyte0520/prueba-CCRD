"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as productosService from "@/lib/services/productos.service"
import * as categoriasService from "@/lib/services/categorias.service"
import { useToast } from "@/hooks/use-toast"
import { checkSubscriptionLimit } from "@/lib/subscription"

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas")
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria_id: "",
    precio_venta: "",
    precio_compra: "",
    stock_actual: "",
    stock_minimo: "",
    aplica_itbis: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productosData, categoriasData] = await Promise.all([
        productosService.getAllProductos(),
        categoriasService.getAllCategorias(),
      ])
      setProductos(productosData)
      setCategorias(categoriasData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const canAdd = await checkSubscriptionLimit("products", productos.length)
    if (!canAdd) {
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite de productos para tu plan. Actualiza tu suscripción.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await productosService.createProductoSimple({
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria_id,
        precio_venta: Number.parseFloat(formData.precio_venta),
        precio_compra: Number.parseFloat(formData.precio_compra),
        stock_actual: Number.parseInt(formData.stock_actual),
        stock_minimo: Number.parseInt(formData.stock_minimo),
        aplica_itbis: formData.aplica_itbis,
        estado: "activo",
      })

      toast({
        title: "Producto creado",
        description: "El producto se ha guardado correctamente",
      })

      setDialogAbierto(false)
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria_id: "",
        precio_venta: "",
        precio_compra: "",
        stock_actual: "",
        stock_minimo: "",
        aplica_itbis: false,
      })
      loadData()
    } catch (error) {
      console.error("[v0] Error creating producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      await productosService.deleteProductoSimple(id)
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      })
      loadData()
    } catch (error) {
      console.error("[v0] Error deleting producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const productosFiltrados = productos.filter((producto) => {
    const matchBusqueda =
      producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo?.toLowerCase().includes(busqueda.toLowerCase())

    const matchCategoria = categoriaFiltro === "todas" || producto.categoria_id === categoriaFiltro

    return matchBusqueda && matchCategoria
  })

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-navy text-3xl font-bold text-balance">Productos</h1>
              <p className="text-muted-foreground">Gestión de productos e inventario</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Producto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigo">Código *</Label>
                        <Input
                          id="codigo"
                          placeholder="PROD-001"
                          value={formData.codigo}
                          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría *</Label>
                        <Select
                          value={formData.categoria_id}
                          onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                        >
                          <SelectTrigger id="categoria">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        placeholder="Nombre del producto"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Input
                        id="descripcion"
                        placeholder="Descripción del producto"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="precio">Precio *</Label>
                        <Input
                          id="precio"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.precio_venta}
                          onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="costo">Costo *</Label>
                        <Input
                          id="costo"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.precio_compra}
                          onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="existencia">Existencia *</Label>
                        <Input
                          id="existencia"
                          type="number"
                          placeholder="0"
                          value={formData.stock_actual}
                          onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimo">Stock Mínimo *</Label>
                        <Input
                          id="minimo"
                          type="number"
                          placeholder="0"
                          value={formData.stock_minimo}
                          onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <input
                          type="checkbox"
                          id="itbis"
                          className="h-4 w-4"
                          checked={formData.aplica_itbis}
                          onChange={(e) => setFormData({ ...formData, aplica_itbis: e.target.checked })}
                        />
                        <Label htmlFor="itbis" className="cursor-pointer">
                          Aplica ITBIS (18%)
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogAbierto(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Producto
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="busqueda">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="busqueda"
                      placeholder="Buscar por nombre o código..."
                      className="pl-10"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full space-y-2 md:w-48">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                    <SelectTrigger id="categoria">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
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
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                      <TableHead className="text-right">Existencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No se encontraron productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell className="font-mono text-sm">{producto.codigo}</TableCell>
                          <TableCell className="font-medium">{producto.nombre}</TableCell>
                          <TableCell>{producto.categorias?.nombre || "N/A"}</TableCell>
                          <TableCell className="text-right">RD$ {producto.precio_venta?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">RD$ {producto.precio_compra?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-medium">{producto.stock_actual}</span>
                              {producto.stock_actual <= producto.stock_minimo && (
                                <Badge variant="destructive" className="text-xs">
                                  Bajo
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={producto.estado === "activo" ? "default" : "secondary"}>
                              {producto.estado === "activo" ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(producto.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
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
