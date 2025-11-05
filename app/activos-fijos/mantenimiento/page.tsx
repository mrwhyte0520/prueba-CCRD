"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Wrench, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import * as mantenimientoService from "@/lib/services/mantenimiento-activos.service"
import * as activosService from "@/lib/services/activos-fijos.service"

interface Mantenimiento {
  id: string
  activoId: string
  activoCodigo: string
  activoDescripcion: string
  tipo: "Preventivo" | "Correctivo" | "Predictivo"
  fecha: string
  fechaProxima: string | null
  descripcion: string
  costo: number
  proveedor: string
  responsable: string
  estado: "Programado" | "En Proceso" | "Completado" | "Cancelado"
  observaciones: string
}

export default function MantenimientoPage() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [activos, setActivos] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState("all")
  const [filterEstado, setFilterEstado] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    activoId: "",
    tipo: "Preventivo" as "Preventivo" | "Correctivo" | "Predictivo",
    fecha: new Date().toISOString().split("T")[0],
    fechaProxima: "",
    descripcion: "",
    costo: 0,
    proveedor: "",
    responsable: "",
    observaciones: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501" // TODO: Get from auth

      const [mantenimientosData, activosData] = await Promise.all([
        mantenimientoService.getall(empresaId),
        activosService.getActivos(empresaId),
      ])

      setMantenimientos(mantenimientosData)
      setActivos(activosData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501" // TODO: Get from auth
      const tipoNormalized = formData.tipo.toLowerCase() as "preventivo" | "correctivo" | "predictivo";

      await mantenimientoService.createMantenimiento(
  empresaId,
  {
    activo_fijo_id: formData.activoId,
    tipo: tipoNormalized, // match con "preventivo" | "correctivo" | "predictivo"
    fecha: formData.fecha,
    proximo_mantenimiento: formData.fechaProxima || null,
    descripcion: formData.descripcion,
    costo: formData.costo,
    proveedor: formData.proveedor,
    realizado_por: formData.responsable,
  }
)

      setIsDialogOpen(false)
      loadData()

      // Reset form
      setFormData({
        activoId: "",
        tipo: "Preventivo",
        fecha: new Date().toISOString().split("T")[0],
        fechaProxima: "",
        descripcion: "",
        costo: 0,
        proveedor: "",
        responsable: "",
        observaciones: "",
      })
    } catch (error) {
      console.error("Error creating mantenimiento:", error)
    }
  }

  const filteredMantenimientos = mantenimientos.filter((mant) => {
    const matchesSearch =
      mant.activoDescripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mant.activoCodigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mant.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = filterTipo === "all" || mant.tipo === filterTipo
    const matchesEstado = filterEstado === "all" || mant.estado === filterEstado
    return matchesSearch && matchesTipo && matchesEstado
  })

  const totalCosto = mantenimientos.filter((m) => m.estado === "Completado").reduce((sum, m) => sum + m.costo, 0)
  const programados = mantenimientos.filter((m) => m.estado === "Programado").length
  const enProceso = mantenimientos.filter((m) => m.estado === "En Proceso").length
  const completados = mantenimientos.filter((m) => m.estado === "Completado").length

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mantenimiento de Activos</h1>
          <p className="text-muted-foreground">Gestión y seguimiento de mantenimientos preventivos y correctivos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Programar Mantenimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Programar Mantenimiento</DialogTitle>
              <DialogDescription>Complete la información del mantenimiento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="activo">Activo Fijo</Label>
                <Select
                  value={formData.activoId}
                  onValueChange={(value) => setFormData({ ...formData, activoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar activo" />
                  </SelectTrigger>
                  <SelectContent>
                    {activos.map((activo) => (
                      <SelectItem key={activo.id} value={activo.id}>
                        {activo.codigo} - {activo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Mantenimiento</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preventivo">Preventivo</SelectItem>
                      <SelectItem value="Correctivo">Correctivo</SelectItem>
                      <SelectItem value="Predictivo">Predictivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha Programada</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Mantenimiento</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalle las actividades a realizar..."
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costo">Costo Estimado</Label>
                  <Input
                    id="costo"
                    type="number"
                    placeholder="0.00"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    placeholder="Nombre del proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  placeholder="Nombre del responsable"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones adicionales..."
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>Programar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programados</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programados}</div>
            <p className="text-xs text-muted-foreground">Pendientes de realizar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enProceso}</div>
            <p className="text-xs text-muted-foreground">En ejecución</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completados}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RD$ {totalCosto.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Mantenimientos realizados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Mantenimientos</CardTitle>
          <CardDescription>Registro de todos los mantenimientos programados y realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por activo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Preventivo">Preventivo</SelectItem>
                <SelectItem value="Correctivo">Correctivo</SelectItem>
                <SelectItem value="Predictivo">Predictivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Programado">Programado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Fecha</th>
                    <th className="p-3 text-left text-sm font-medium">Activo</th>
                    <th className="p-3 text-left text-sm font-medium">Tipo</th>
                    <th className="p-3 text-left text-sm font-medium">Descripción</th>
                    <th className="p-3 text-right text-sm font-medium">Costo</th>
                    <th className="p-3 text-left text-sm font-medium">Proveedor</th>
                    <th className="p-3 text-left text-sm font-medium">Estado</th>
                    <th className="p-3 text-left text-sm font-medium">Próximo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMantenimientos.map((mant) => (
                    <tr key={mant.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{new Date(mant.fecha).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">
                        <div>
                          <div className="font-medium">{mant.activoCodigo}</div>
                          <div className="text-xs text-muted-foreground">{mant.activoDescripcion}</div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge
                          variant={
                            mant.tipo === "Preventivo"
                              ? "default"
                              : mant.tipo === "Correctivo"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {mant.tipo}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate" title={mant.descripcion}>
                        {mant.descripcion}
                      </td>
                      <td className="p-3 text-right text-sm">RD$ {mant.costo.toLocaleString()}</td>
                      <td className="p-3 text-sm">{mant.proveedor}</td>
                      <td className="p-3 text-sm">
                        <Badge
                          variant={
                            mant.estado === "Completado"
                              ? "default"
                              : mant.estado === "En Proceso"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {mant.estado}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {mant.fechaProxima ? new Date(mant.fechaProxima).toLocaleDateString() : "-"}
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
  )
}
