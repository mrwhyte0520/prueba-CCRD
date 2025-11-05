"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingCart, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getProducts } from "@/lib/supabase/helpers"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function POSInventarioPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas")
  const [productosSeleccionados, setProductosSeleccionados] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      // Solo mostrar productos activos con stock disponible
      const productosActivos = data.filter((p: any) => p.status === "active" && p.stock > 0)
      setProductos(productosActivos)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleProducto = (productoId: string) => {
    const nuevaSeleccion = new Set(productosSeleccionados)
    if (nuevaSeleccion.has(productoId)) {
      nuevaSeleccion.delete(productoId)
    } else {
      nuevaSeleccion.add(productoId)
    }
    setProductosSeleccionados(nuevaSeleccion)
  }

  const toggleTodos = () => {
    if (productosSeleccionados.size === productosFiltrados.length) {
      setProductosSeleccionados(new Set())
    } else {
      setProductosSeleccionados(new Set(productosFiltrados.map((p) => p.id)))
    }
  }

  const crearFactura = () => {
    if (productosSeleccionados.size === 0) {
      toast({
        title: "Selección requerida",
        description: "Debes seleccionar al menos un producto",
        variant: "destructive",
      })
      return
    }

    // Guardar productos seleccionados en localStorage para usarlos en nueva-factura
    const productosParaFactura = productos.filter((p) => productosSeleccionados.has(p.id))
    localStorage.setItem("productosPreseleccionados", JSON.stringify(productosParaFactura))

    // Redirigir a nueva factura
    router.push("/pos/nueva-factura")
  }

  const productosFiltrados = productos.filter((producto) => {
    const matchBusqueda =
      producto.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.code?.toLowerCase().includes(busqueda.toLowerCase())

    const matchCategoria = categoriaFiltro === "todas" || producto.category === categoriaFiltro

    return matchBusqueda && matchCategoria
  })

  const categorias = ["Electrónica", "Alimentos", "Ropa", "Hogar", "Otros"]

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-balance text-3xl font-bold text-navy">Inventario POS</h1>
              <p className="text-muted-foreground">Selecciona productos para facturar</p>
            </div>
            <Button onClick={crearFactura} disabled={productosSeleccionados.size === 0} size="lg">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Facturar ({productosSeleccionados.size})
            </Button>
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
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
              <CardTitle>Productos Disponibles</CardTitle>
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
                      <TableHead className="w-[50px]">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer"
                          checked={
                            productosFiltrados.length > 0 && productosSeleccionados.size === productosFiltrados.length
                          }
                          onChange={toggleTodos}
                        />
                      </TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>ITBIS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No se encontraron productos disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map((producto) => (
                        <TableRow
                          key={producto.id}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            productosSeleccionados.has(producto.id) ? "bg-blue-50" : ""
                          }`}
                          onClick={() => toggleProducto(producto.id)}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="h-4 w-4 cursor-pointer"
                              checked={productosSeleccionados.has(producto.id)}
                              onChange={() => toggleProducto(producto.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{producto.code}</TableCell>
                          <TableCell className="font-medium">{producto.name}</TableCell>
                          <TableCell>{producto.category}</TableCell>
                          <TableCell className="text-right text-lg font-semibold text-navy">
                            RD$ {producto.price?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-medium">{producto.stock}</span>
                              {producto.stock <= producto.min_stock && (
                                <Badge variant="secondary" className="text-xs">
                                  Bajo
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {producto.applies_itbis ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                18%
                              </Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {productosSeleccionados.size > 0 && (
            <div className="fixed bottom-6 right-6 animate-scale-in">
              <Card className="border-2 border-navy shadow-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Productos seleccionados</p>
                      <p className="text-2xl font-bold text-navy">{productosSeleccionados.size}</p>
                    </div>
                    <Button onClick={crearFactura} size="lg" className="bg-navy hover:bg-navy-light">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Crear Factura
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
