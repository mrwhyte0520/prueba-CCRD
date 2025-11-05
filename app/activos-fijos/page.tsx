"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as activosFijosService  from "@/lib/services/activos-fijos.service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2 } from "lucide-react"

type EstadoActivo = "activo" | "en_mantenimiento" | "dado_de_baja" | "vendido";
interface ActivoFijo {
  
  id: string
  codigo: string
  descripcion: string
  categoria: string
  fecha_adquisicion: string
  costo_adquisicion: number
  vida_util_anos: number
  valor_residual: number
  metodo_depreciacion: string
  depreciacion_acumulada: number
  valor_neto: number
  ubicacion: string
  estado: EstadoActivo;
  responsable: string
   
}

export default function RegistroActivosPage() {
  const [activos, setActivos] = useState<ActivoFijo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterEstado, setFilterEstado] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingActivo, setEditingActivo] = useState<ActivoFijo | null>(null)
   const empresaId = "00000000-0000-0000-0000-000000000000"
   
  const [formData, setFormData] = useState({
    codigo: "",
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
    try {
      setLoading(true)
      const data = await activosFijosService.getActivosFijos(empresaId)
      setActivos(data)
    } catch (error) {
      console.error("Error loading activos:", error)
      alert("Error al cargar los activos.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const openDialogForEdit = (activo: ActivoFijo) => {
    setEditingActivo(activo)
    setFormData({
      codigo: activo.codigo,
      descripcion: activo.descripcion,
      categoria: activo.categoria,
      fechaAdquisicion: activo.fecha_adquisicion,
      costoAdquisicion: activo.costo_adquisicion.toString(),
      vidaUtil: activo.vida_util_anos.toString(),
      valorResidual: activo.valor_residual.toString(),
      metodoDepreciacion: activo.metodo_depreciacion,
      ubicacion: activo.ubicacion,
      responsable: activo.responsable,
    })
    setIsDialogOpen(true)
  }

  const handleSaveActivo = async () => {
    if (!formData.codigo || !formData.descripcion || !formData.categoria) {
      alert("Por favor complete todos los campos obligatorios (Código, Descripción, Categoría).")
      return
    }

    const costoAdquisicion = parseFloat(formData.costoAdquisicion)
    const vidaUtil = parseInt(formData.vidaUtil)
    const valorResidual = parseFloat(formData.valorResidual)

    if (isNaN(costoAdquisicion) || isNaN(vidaUtil) || isNaN(valorResidual)) {
      alert("Ingrese valores numéricos válidos para costo, vida útil y valor residual.")
      return
    }

    try {
      if (editingActivo) {
        
        await activosFijosService.updateActivoFijo(editingActivo.id,empresaId, {
          codigo: formData.codigo,
          descripcion: formData.descripcion,
          categoria: formData.categoria,
          fecha_adquisicion: formData.fechaAdquisicion,
          costo_adquisicion: costoAdquisicion,
          vida_util_anos: vidaUtil,
          valor_residual: valorResidual,
          metodo_depreciacion: formData.metodoDepreciacion as "lineal" | "acelerada" | "unidades_produccion",
          ubicacion: formData.ubicacion,
          responsable: formData.responsable,
        })
      } else {
        await activosFijosService.createActivoFijo(empresaId,{
           nombre: formData.descripcion, // o algún otro campo
  codigo: formData.codigo,
  descripcion: formData.descripcion,
  categoria: formData.categoria,
  fecha_adquisicion: formData.fechaAdquisicion,
  costo_adquisicion: costoAdquisicion,
  vida_util_anos: vidaUtil,
  valor_residual: valorResidual,
  metodo_depreciacion: formData.metodoDepreciacion as "lineal" | "acelerada" | "unidades_produccion",
  ubicacion: formData.ubicacion,
  responsable: formData.responsable,
  estado: "activo", // valor por defecto al crear
  valor_libro: costoAdquisicion - valorResidual, // o 0 si quieres calcular después
  depreciacion_acumulada: 0, // al crear, generalmente empieza en 0
        })
      }

      await loadActivos()
      setIsDialogOpen(false)
      setEditingActivo(null)
      setFormData({
        codigo: "",
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
    } catch (error) {
      console.error("Error saving activo:", error)
      alert("Error al guardar el activo")
    }
  }

  const handleDeleteActivo = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este activo?")) return
    try {
      await  activosFijosService.deleteActivoFijo(id,empresaId)
      await loadActivos()
    } catch (error) {
      console.error("Error deleting activo:", error)
      alert("Error al eliminar el activo")
    }
  }

  const filteredActivos = useMemo(() => {
    return activos.filter((activo) => {
      const matchesSearch =
        activo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activo.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategoria = filterCategoria === "all" || activo.categoria === filterCategoria
      const matchesEstado = filterEstado === "all" || activo.estado === filterEstado
      return matchesSearch && matchesCategoria && matchesEstado
    })
  }, [activos, searchTerm, filterCategoria, filterEstado])

  const totalCostoAdquisicion = useMemo(
    () => activos.reduce((sum, a) => sum + a.costo_adquisicion, 0),
    [activos]
  )
  const totalDepreciacionAcumulada = useMemo(
    () => activos.reduce((sum, a) => sum + a.depreciacion_acumulada, 0),
    [activos]
  )
  const totalValorNeto = useMemo(() => activos.reduce((sum, a) => sum + a.valor_neto, 0), [activos])

  const categorias = useMemo(() => Array.from(new Set(activos.map((a) => a.categoria))), [activos])
const estadoMap: Record<string, string> = {
  activo: "Activo",
  en_mantenimiento: "Depreciado",
  vendido: "Vendido",
  dado_de_baja: "Dado de Baja",
};
  const getBadgeVariant = (estado: string) => {
  switch (estado) {
    case "activo":
      return "default";
    case "en_mantenimiento":
      return "secondary";
    case "vendido":
      return "destructive";
    case "dado_de_baja":
      return "outline";
    default:
      return "default";
  }
};


  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando activos...</p>
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
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) setEditingActivo(null)
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {editingActivo ? "Editar Activo" : "Nuevo Activo"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingActivo ? "Editar Activo Fijo" : "Registrar Nuevo Activo Fijo"}</DialogTitle>
                    <DialogDescription>Complete la información del activo fijo</DialogDescription>
                  </DialogHeader>

                  {/* Formulario */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                    <div className="flex flex-col">
                      <Label htmlFor="codigo">Código</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => handleInputChange("codigo", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Input
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange("descripcion", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="categoria">Categoría</Label>
                      <Input
                        id="categoria"
                        value={formData.categoria}
                        onChange={(e) => handleInputChange("categoria", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="fechaAdquisicion">Fecha de Adquisición</Label>
                      <Input
                        id="fechaAdquisicion"
                        type="date"
                        value={formData.fechaAdquisicion}
                        onChange={(e) => handleInputChange("fechaAdquisicion", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="costoAdquisicion">Costo de Adquisición</Label>
                      <Input
                        id="costoAdquisicion"
                        type="number"
                        value={formData.costoAdquisicion}
                        onChange={(e) => handleInputChange("costoAdquisicion", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="vidaUtil">Vida Útil (años)</Label>
                      <Input
                        id="vidaUtil"
                        type="number"
                        value={formData.vidaUtil}
                        onChange={(e) => handleInputChange("vidaUtil", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="valorResidual">Valor Residual</Label>
                      <Input
                        id="valorResidual"
                        type="number"
                        value={formData.valorResidual}
                        onChange={(e) => handleInputChange("valorResidual", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="metodoDepreciacion">Método de Depreciación</Label>
                      <Input
                        id="metodoDepreciacion"
                        value={formData.metodoDepreciacion}
                        onChange={(e) => handleInputChange("metodoDepreciacion", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="ubicacion">Ubicación</Label>
                      <Input
                        id="ubicacion"
                        value={formData.ubicacion}
                        onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="responsable">Responsable</Label>
                      <Input
                        id="responsable"
                        value={formData.responsable}
                        onChange={(e) => handleInputChange("responsable", e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveActivo}>{editingActivo ? "Guardar cambios" : "Registrar"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={filterCategoria}
                  onValueChange={(value) => setFilterCategoria(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterEstado} onValueChange={(value) => setFilterEstado(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Depreciado">Depreciado</SelectItem>
                    <SelectItem value="Vendido">Vendido</SelectItem>
                    <SelectItem value="Dado de Baja">Dado de Baja</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tabla de activos */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Activos</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 border">Código</th>
                      <th className="p-2 border">Descripción</th>
                      <th className="p-2 border">Categoría</th>
                      <th className="p-2 border">Costo</th>
                      <th className="p-2 border">Depreciación</th>
                      <th className="p-2 border">Valor Neto</th>
                      <th className="p-2 border">Estado</th>
                      <th className="p-2 border">Responsable</th>
                      <th className="p-2 border">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivos.map((activo) => (
                      <tr key={activo.id} className="hover:bg-muted/50">
                        <td className="p-2 border">{activo.codigo}</td>
                        <td className="p-2 border">{activo.descripcion}</td>
                        <td className="p-2 border">{activo.categoria}</td>
                        <td className="p-2 border">{activo.costo_adquisicion}</td>
                        <td className="p-2 border">{activo.depreciacion_acumulada}</td>
                        <td className="p-2 border">{activo.valor_neto}</td>
                        <td className="p-2 border">
                          <Badge variant={getBadgeVariant(activo.estado)}>{activo.estado}</Badge>
                        </td>
                        <td className="p-2 border">{activo.responsable}</td>
                        <td className="p-2 border flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openDialogForEdit(activo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteActivo(activo.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted">
                      <td className="p-2 border font-bold">Totales</td>
                      <td colSpan={2}></td>
                      <td className="p-2 border font-bold">{totalCostoAdquisicion}</td>
                      <td className="p-2 border font-bold">{totalDepreciacionAcumulada}</td>
                      <td className="p-2 border font-bold">{totalValorNeto}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
