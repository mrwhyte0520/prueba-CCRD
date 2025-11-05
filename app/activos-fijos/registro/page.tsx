"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, FileText, TrendingUp, AlertCircle } from "lucide-react"
import * as activosFijosService from "@/lib/services/activos-fijos.service"
const mapMetodoDepreciacion = (value: string) => {
  switch (value) {
    case "Línea Recta":
      return "lineal";
    case "Saldos Decrecientes":
      return "acelerada";
    case "Suma de Dígitos":
      return "unidades_produccion";
    default:
      return "lineal"; // valor por defecto
  }
}
interface ActivoFijo {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  fecha_adquisicion: string
  costo_adquisicion: number
  vida_util: number
  valor_residual: number
  metodo_depreciacion: string
  depreciacion_acumulada: number
  valor_neto: number
  ubicacion: string
  estado: "activo" | "depreciado" | "vendido" | "baja"
  responsable: string
}

export default function RegistroActivosPage() {
  const [activos, setActivos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterEstado, setFilterEstado] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    codigo: "",
    nombre:"",
    descripcion: "",
    categoria: "",
    fechaAdquisicion: "",
    costoAdquisicion: "",
    vidaUtil: "",
    valorResidual: "",
    metodoDepreciacion: "",
    ubicacion: "",
    responsable: "",
  })

  useEffect(() => {
    loadActivos()
  }, [])

  const loadActivos = async () => {
    const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
    try {
      setLoading(true)
      const data = await activosFijosService.getActivosFijos(empresaId)
      setActivos(data)
    } catch (error) {
      console.error("Error loading activos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveActivo = async () => {
    
    try {
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
    await activosFijosService.createActivoFijo(empresaId, {
  codigo: formData.codigo,
  nombre: formData.nombre,          // <-- obligatorio
  descripcion: formData.descripcion ?? null,
  categoria: formData.categoria,
  fecha_adquisicion: formData.fechaAdquisicion,
  costo_adquisicion: Number.parseFloat(formData.costoAdquisicion),
  vida_util_anos: Number.parseInt(formData.vidaUtil),
  valor_residual: Number.parseFloat(formData.valorResidual),
  metodo_depreciacion: mapMetodoDepreciacion(formData.metodoDepreciacion),
  ubicacion: formData.ubicacion ?? null,
  responsable: formData.responsable ?? null,
  estado: "activo",
  valor_libro: Number.parseFloat(formData.costoAdquisicion),
  depreciacion_acumulada: 0
})



      setIsDialogOpen(false)
      setFormData({
        codigo: "",
        descripcion: "",
        nombre:"",
        categoria: "",
        fechaAdquisicion: "",
        costoAdquisicion: "",
        vidaUtil: "",
        valorResidual: "",
        metodoDepreciacion: "",
        ubicacion: "",
        responsable: "",
      })
      loadActivos()
    } catch (error) {
      console.error("Error saving activo:", error)
      alert("Error al guardar el activo")
    }
  }

  const handleDeleteActivo = async (id: string) => {
    const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
    if (!confirm("¿Está seguro de eliminar este activo?")) return

    try {
      await activosFijosService.deleteActivoFijo(empresaId, id)
      loadActivos()
    } catch (error) {
      console.error("Error deleting activo:", error)
      alert("Error al eliminar el activo")
    }
  }

  const filteredActivos = activos.filter((activo) => {
    const matchesSearch =
      activo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activo.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = filterCategoria === "all" || activo.categoria === filterCategoria
    const matchesEstado = filterEstado === "all" || activo.estado === filterEstado
    return matchesSearch && matchesCategoria && matchesEstado
  })

  const totalCostoAdquisicion = activos.reduce((sum, a) => sum + (a.costo_adquisicion || 0), 0)
  const totalDepreciacionAcumulada = activos.reduce((sum, a) => sum + (a.depreciacion_acumulada || 0), 0)
  const totalValorNeto = activos.reduce((sum, a) => sum + (a.valor_neto || 0), 0)

  const categorias = Array.from(new Set(activos.map((a) => a.categoria).filter(Boolean)))

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
                <p className="text-muted-foreground">Cargando activos fijos...</p>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Registro de Activos Fijos</h1>
                <p className="text-muted-foreground">Gestión y control de activos fijos de la empresa</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Activo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Activo Fijo</DialogTitle>
                    <DialogDescription>Complete la información del activo fijo</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigo">Código</Label>
                        <Input
                          id="codigo"
                          placeholder="AF-XXX"
                          value={formData.codigo}
                          onChange={(e) => handleInputChange("codigo", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <Select
                          value={formData.categoria}
                          onValueChange={(value) => handleInputChange("categoria", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Equipos de Computación">Equipos de Computación</SelectItem>
                            <SelectItem value="Vehículos">Vehículos</SelectItem>
                            <SelectItem value="Muebles y Enseres">Muebles y Enseres</SelectItem>
                            <SelectItem value="Maquinaria">Maquinaria</SelectItem>
                            <SelectItem value="Edificios">Edificios</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Input
                        id="descripcion"
                        placeholder="Descripción detallada del activo"
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange("descripcion", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fechaAdquisicion">Fecha de Adquisición</Label>
                        <Input
                          id="fechaAdquisicion"
                          type="date"
                          value={formData.fechaAdquisicion}
                          onChange={(e) => handleInputChange("fechaAdquisicion", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="costoAdquisicion">Costo de Adquisición</Label>
                        <Input
                          id="costoAdquisicion"
                          type="number"
                          placeholder="0.00"
                          value={formData.costoAdquisicion}
                          onChange={(e) => handleInputChange("costoAdquisicion", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vidaUtil">Vida Útil (años)</Label>
                        <Input
                          id="vidaUtil"
                          type="number"
                          placeholder="0"
                          value={formData.vidaUtil}
                          onChange={(e) => handleInputChange("vidaUtil", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valorResidual">Valor Residual</Label>
                        <Input
                          id="valorResidual"
                          type="number"
                          placeholder="0.00"
                          value={formData.valorResidual}
                          onChange={(e) => handleInputChange("valorResidual", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="metodo">Método Depreciación</Label>
                        <Select
                          value={formData.metodoDepreciacion}
                          onValueChange={(value) => handleInputChange("metodoDepreciacion", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Línea Recta">Línea Recta</SelectItem>
                            <SelectItem value="Saldos Decrecientes">Saldos Decrecientes</SelectItem>
                            <SelectItem value="Suma de Dígitos">Suma de Dígitos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ubicacion">Ubicación</Label>
                        <Input
                          id="ubicacion"
                          placeholder="Ubicación física"
                          value={formData.ubicacion}
                          onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responsable">Responsable</Label>
                        <Input
                          id="responsable"
                          placeholder="Nombre del responsable"
                          value={formData.responsable}
                          onChange={(e) => handleInputChange("responsable", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveActivo}>Guardar Activo</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activos.length}</div>
                  <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalCostoAdquisicion.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Costo de adquisición</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Depreciación Acumulada</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalDepreciacionAcumulada.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total depreciado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Neto</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalValorNeto.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Valor en libros</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activos Fijos</CardTitle>
                <CardDescription>Lista de todos los activos fijos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col gap-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterEstado} onValueChange={setFilterEstado}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="depreciado">Depreciado</SelectItem>
                      <SelectItem value="vendido">Vendido</SelectItem>
                      <SelectItem value="baja">Dado de Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left text-sm font-medium">Código</th>
                          <th className="p-3 text-left text-sm font-medium">Descripción</th>
                          <th className="p-3 text-left text-sm font-medium">Categoría</th>
                          <th className="p-3 text-left text-sm font-medium">Fecha Adq.</th>
                          <th className="p-3 text-right text-sm font-medium">Costo</th>
                          <th className="p-3 text-right text-sm font-medium">Dep. Acum.</th>
                          <th className="p-3 text-right text-sm font-medium">Valor Neto</th>
                          <th className="p-3 text-left text-sm font-medium">Estado</th>
                          <th className="p-3 text-center text-sm font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivos.map((activo) => (
                          <tr key={activo.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-sm font-medium">{activo.codigo}</td>
                            <td className="p-3 text-sm">
                              <div>
                                <div className="font-medium">{activo.descripcion}</div>
                                <div className="text-xs text-muted-foreground">{activo.ubicacion}</div>
                              </div>
                            </td>
                            <td className="p-3 text-sm">{activo.categoria}</td>
                            <td className="p-3 text-sm">
                              {activo.fecha_adquisicion ? new Date(activo.fecha_adquisicion).toLocaleDateString() : "-"}
                            </td>
                            <td className="p-3 text-right text-sm">
                              RD$ {(activo.costo_adquisicion || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-right text-sm text-red-600">
                              RD$ {(activo.depreciacion_acumulada || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-right text-sm font-medium">
                              RD$ {(activo.valor_neto || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-sm">
                              <Badge variant={activo.estado === "activo" ? "default" : "secondary"}>
                                {activo.estado}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteActivo(activo.id)}>
                                  <Trash2 className="h-4 w-4" />
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
          </div>
        </main>
      </div>
    </div>
  )
}
