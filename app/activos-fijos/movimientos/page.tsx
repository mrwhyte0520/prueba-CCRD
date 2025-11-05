"use client"

import { useState } from "react"
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
import { Plus, Search, ArrowRightLeft, MapPin, TrendingUp, FileText } from "lucide-react"

interface Movimiento {
  id: string
  activoId: string
  activoCodigo: string
  activoDescripcion: string
  tipo: "Transferencia" | "Asignación" | "Devolución" | "Baja"
  fecha: string
  ubicacionOrigen: string
  ubicacionDestino: string
  responsableOrigen: string
  responsableDestino: string
  motivo: string
  estado: "Pendiente" | "En Tránsito" | "Completado" | "Cancelado"
  observaciones: string
}

const mockMovimientos: Movimiento[] = [
  {
    id: "1",
    activoId: "AF-001",
    activoCodigo: "AF-001",
    activoDescripcion: "Computadora Dell Latitude 5520",
    tipo: "Transferencia",
    fecha: "2024-01-20",
    ubicacionOrigen: "Oficina Principal",
    ubicacionDestino: "Sucursal Norte",
    responsableOrigen: "Juan Pérez",
    responsableDestino: "María García",
    motivo: "Reasignación por necesidad operativa",
    estado: "Completado",
    observaciones: "Transferencia realizada sin novedad",
  },
  {
    id: "2",
    activoId: "AF-002",
    activoCodigo: "AF-002",
    activoDescripcion: "Vehículo Toyota Corolla 2022",
    tipo: "Asignación",
    fecha: "2024-02-15",
    ubicacionOrigen: "Flota",
    ubicacionDestino: "Departamento Ventas",
    responsableOrigen: "Administración",
    responsableDestino: "Carlos Méndez",
    motivo: "Asignación para uso del equipo de ventas",
    estado: "Completado",
    observaciones: "Vehículo asignado con documentación completa",
  },
  {
    id: "3",
    activoId: "AF-003",
    activoCodigo: "AF-003",
    activoDescripcion: "Mobiliario de Oficina - Escritorios",
    tipo: "Transferencia",
    fecha: "2024-03-10",
    ubicacionOrigen: "Oficina Principal",
    ubicacionDestino: "Sucursal Este",
    responsableOrigen: "Administración",
    responsableDestino: "Luis Fernández",
    motivo: "Reubicación por expansión de sucursal",
    estado: "En Tránsito",
    observaciones: "Pendiente confirmación de recepción",
  },
  {
    id: "4",
    activoId: "AF-004",
    activoCodigo: "AF-004",
    activoDescripcion: "Impresora HP LaserJet Pro",
    tipo: "Baja",
    fecha: "2024-03-25",
    ubicacionOrigen: "Oficina Principal",
    ubicacionDestino: "Almacén de Baja",
    responsableOrigen: "Ana Rodríguez",
    responsableDestino: "Administración",
    motivo: "Equipo obsoleto, fuera de servicio",
    estado: "Pendiente",
    observaciones: "Pendiente aprobación de gerencia",
  },
]

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(mockMovimientos)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState("all")
  const [filterEstado, setFilterEstado] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredMovimientos = movimientos.filter((mov) => {
    const matchesSearch =
      mov.activoDescripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.activoCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.ubicacionOrigen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.ubicacionDestino.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = filterTipo === "all" || mov.tipo === filterTipo
    const matchesEstado = filterEstado === "all" || mov.estado === filterEstado
    return matchesSearch && matchesTipo && matchesEstado
  })

  const totalMovimientos = movimientos.length
  const pendientes = movimientos.filter((m) => m.estado === "Pendiente").length
  const enTransito = movimientos.filter((m) => m.estado === "En Tránsito").length
  const completados = movimientos.filter((m) => m.estado === "Completado").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Movimientos de Activos</h1>
          <p className="text-muted-foreground">Gestión de transferencias, asignaciones y movimientos de activos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Movimiento de Activo</DialogTitle>
              <DialogDescription>Complete la información del movimiento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="activo">Activo Fijo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar activo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AF-001">AF-001 - Computadora Dell Latitude 5520</SelectItem>
                    <SelectItem value="AF-002">AF-002 - Vehículo Toyota Corolla 2022</SelectItem>
                    <SelectItem value="AF-003">AF-003 - Mobiliario de Oficina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Movimiento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                      <SelectItem value="Asignación">Asignación</SelectItem>
                      <SelectItem value="Devolución">Devolución</SelectItem>
                      <SelectItem value="Baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha del Movimiento</Label>
                  <Input id="fecha" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ubicacionOrigen">Ubicación Origen</Label>
                  <Input id="ubicacionOrigen" placeholder="Ubicación actual" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacionDestino">Ubicación Destino</Label>
                  <Input id="ubicacionDestino" placeholder="Nueva ubicación" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsableOrigen">Responsable Origen</Label>
                  <Input id="responsableOrigen" placeholder="Quien entrega" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsableDestino">Responsable Destino</Label>
                  <Input id="responsableDestino" placeholder="Quien recibe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo del Movimiento</Label>
                <Textarea id="motivo" placeholder="Describa el motivo del movimiento..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea id="observaciones" placeholder="Observaciones adicionales..." rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Registrar Movimiento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovimientos}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <MapPin className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendientes}</div>
            <p className="text-xs text-muted-foreground">Por procesar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enTransito}</div>
            <p className="text-xs text-muted-foreground">En proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completados}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>Registro de todos los movimientos de activos fijos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por activo o ubicación..."
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
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Asignación">Asignación</SelectItem>
                <SelectItem value="Devolución">Devolución</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Tránsito">En Tránsito</SelectItem>
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
                    <th className="p-3 text-left text-sm font-medium">Origen → Destino</th>
                    <th className="p-3 text-left text-sm font-medium">Responsables</th>
                    <th className="p-3 text-left text-sm font-medium">Motivo</th>
                    <th className="p-3 text-left text-sm font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovimientos.map((mov) => (
                    <tr key={mov.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{new Date(mov.fecha).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">
                        <div>
                          <div className="font-medium">{mov.activoCodigo}</div>
                          <div className="text-xs text-muted-foreground">{mov.activoDescripcion}</div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge
                          variant={
                            mov.tipo === "Transferencia" ? "default" : mov.tipo === "Baja" ? "destructive" : "secondary"
                          }
                        >
                          {mov.tipo}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{mov.ubicacionOrigen}</span>
                          <ArrowRightLeft className="h-3 w-3" />
                          <span className="font-medium">{mov.ubicacionDestino}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">De: {mov.responsableOrigen}</div>
                          <div className="text-xs">Para: {mov.responsableDestino}</div>
                        </div>
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate" title={mov.motivo}>
                        {mov.motivo}
                      </td>
                      <td className="p-3 text-sm">
                        <Badge
                          variant={
                            mov.estado === "Completado"
                              ? "default"
                              : mov.estado === "En Tránsito"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {mov.estado}
                        </Badge>
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
