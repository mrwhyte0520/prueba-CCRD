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
import { Plus, TrendingUp, TrendingDown, FileText, AlertCircle } from "lucide-react"

interface Revaluacion {
  id: string
  activoId: string
  activoCodigo: string
  activoDescripcion: string
  fecha: string
  valorAnterior: number
  valorNuevo: number
  diferencia: number
  porcentajeCambio: number
  tipo: "Aumento" | "Disminución"
  motivo: string
  responsable: string
  estado: "Pendiente" | "Aprobada" | "Rechazada"
}

const mockRevaluaciones: Revaluacion[] = [
  {
    id: "1",
    activoId: "AF-002",
    activoCodigo: "AF-002",
    activoDescripcion: "Vehículo Toyota Corolla 2022",
    fecha: "2024-01-15",
    valorAnterior: 750000,
    valorNuevo: 850000,
    diferencia: 100000,
    porcentajeCambio: 13.33,
    tipo: "Aumento",
    motivo: "Revaluación por mejoras y mantenimiento mayor realizado",
    responsable: "Carlos Méndez",
    estado: "Aprobada",
  },
  {
    id: "2",
    activoId: "AF-001",
    activoCodigo: "AF-001",
    activoDescripcion: "Computadora Dell Latitude 5520",
    fecha: "2024-02-20",
    valorAnterior: 34000,
    valorNuevo: 28000,
    diferencia: -6000,
    porcentajeCambio: -17.65,
    tipo: "Disminución",
    motivo: "Ajuste por obsolescencia tecnológica acelerada",
    responsable: "Ana Rodríguez",
    estado: "Aprobada",
  },
  {
    id: "3",
    activoId: "AF-005",
    activoCodigo: "AF-005",
    activoDescripcion: "Edificio Oficinas Principales",
    fecha: "2024-03-10",
    valorAnterior: 5000000,
    valorNuevo: 5500000,
    diferencia: 500000,
    porcentajeCambio: 10,
    tipo: "Aumento",
    motivo: "Revaluación por valorización del mercado inmobiliario",
    responsable: "Luis Fernández",
    estado: "Pendiente",
  },
]

export default function RevaluacionPage() {
  const [revaluaciones, setRevaluaciones] = useState<Revaluacion[]>(mockRevaluaciones)
  const [filterEstado, setFilterEstado] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredRevaluaciones = revaluaciones.filter((rev) => filterEstado === "all" || rev.estado === filterEstado)

  const totalAumentos = revaluaciones
    .filter((r) => r.tipo === "Aumento" && r.estado === "Aprobada")
    .reduce((sum, r) => sum + r.diferencia, 0)

  const totalDisminuciones = revaluaciones
    .filter((r) => r.tipo === "Disminución" && r.estado === "Aprobada")
    .reduce((sum, r) => sum + Math.abs(r.diferencia), 0)

  const revaluacionesPendientes = revaluaciones.filter((r) => r.estado === "Pendiente").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revaluación de Activos</h1>
          <p className="text-muted-foreground">Gestión de revaluaciones y ajustes de valor de activos fijos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Revaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Revaluación de Activo</DialogTitle>
              <DialogDescription>Complete la información de la revaluación</DialogDescription>
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
                  <Label htmlFor="fecha">Fecha de Revaluación</Label>
                  <Input id="fecha" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsable">Responsable</Label>
                  <Input id="responsable" placeholder="Nombre del responsable" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorAnterior">Valor Anterior</Label>
                  <Input id="valorAnterior" type="number" placeholder="0.00" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorNuevo">Valor Nuevo</Label>
                  <Input id="valorNuevo" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo de la Revaluación</Label>
                <Textarea id="motivo" placeholder="Describa el motivo de la revaluación..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Guardar Revaluación</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aumentos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">RD$ {totalAumentos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revaluaciones aprobadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disminuciones</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">RD$ {totalDisminuciones.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ajustes aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes Aprobación</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revaluacionesPendientes}</div>
            <p className="text-xs text-muted-foreground">Requieren revisión</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revaluaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revaluaciones.length}</div>
            <p className="text-xs text-muted-foreground">Registradas en el sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Revaluaciones</CardTitle>
              <CardDescription>Registro de todas las revaluaciones de activos fijos</CardDescription>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Aprobada">Aprobada</SelectItem>
                <SelectItem value="Rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Fecha</th>
                    <th className="p-3 text-left text-sm font-medium">Activo</th>
                    <th className="p-3 text-right text-sm font-medium">Valor Anterior</th>
                    <th className="p-3 text-right text-sm font-medium">Valor Nuevo</th>
                    <th className="p-3 text-right text-sm font-medium">Diferencia</th>
                    <th className="p-3 text-center text-sm font-medium">Cambio %</th>
                    <th className="p-3 text-left text-sm font-medium">Motivo</th>
                    <th className="p-3 text-left text-sm font-medium">Estado</th>
                    <th className="p-3 text-center text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRevaluaciones.map((rev) => (
                    <tr key={rev.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{new Date(rev.fecha).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">
                        <div>
                          <div className="font-medium">{rev.activoCodigo}</div>
                          <div className="text-xs text-muted-foreground">{rev.activoDescripcion}</div>
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm">RD$ {rev.valorAnterior.toLocaleString()}</td>
                      <td className="p-3 text-right text-sm font-medium">RD$ {rev.valorNuevo.toLocaleString()}</td>
                      <td
                        className={`p-3 text-right text-sm font-medium ${rev.diferencia > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {rev.diferencia > 0 ? "+" : ""}RD$ {rev.diferencia.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={rev.tipo === "Aumento" ? "default" : "destructive"}>
                          {rev.porcentajeCambio > 0 ? "+" : ""}
                          {rev.porcentajeCambio.toFixed(2)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate" title={rev.motivo}>
                        {rev.motivo}
                      </td>
                      <td className="p-3 text-sm">
                        <Badge
                          variant={
                            rev.estado === "Aprobada"
                              ? "default"
                              : rev.estado === "Pendiente"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {rev.estado}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {rev.estado === "Pendiente" && (
                            <>
                              <Button variant="ghost" size="sm" className="text-green-600">
                                Aprobar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                Rechazar
                              </Button>
                            </>
                          )}
                          {rev.estado !== "Pendiente" && (
                            <Button variant="ghost" size="sm">
                              Ver Detalle
                            </Button>
                          )}
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
  )
}
