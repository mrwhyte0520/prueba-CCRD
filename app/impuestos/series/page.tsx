"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, FileText, AlertTriangle } from "lucide-react"
import * as ncfService from "@/lib/services/ncf.service"
import { createSerieNCF } from "@/lib/services/ncf.service";
interface SerieFiscal {
  id: string
  tipo: string
  descripcion: string
  serie: string
  desde: number
  hasta: number
  fechaAutorizacion: string
  fechaVencimiento: string
  estado: "Activa" | "Vencida" | "Agotada"
}

export default function SeriesFiscalesPage() {
  const [series, setSeries] = useState<SerieFiscal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [nuevaSerie, setNuevaSerie] = useState({
    tipo: "",
    descripcion: "",
    serie: "",
    desde: "",
    hasta: "",
    fechaAutorizacion: "",
    fechaVencimiento: "",
  })

  useEffect(() => {
    loadSeries()
  }, [])

  const loadSeries = async () => {
    try {
      setIsLoading(true)
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501" // TODO: Get from auth
      const data = await ncfService.getSecuenciasNCF(empresaId)

      const seriesFormateadas = data.map((s: any) => {
  let estado: "Activa" | "Vencida" | "Agotada";

  if (!s.activa) {
    estado = "Vencida";
  } else if (s.actual >= s.hasta) {
    estado = "Agotada";
  } else {
    estado = "Activa";
  }

  return {
    id: s.id,
    tipo: s.tipo_comprobante,
    descripcion: s.descripcion || `Comprobante tipo ${s.tipo_comprobante}`,
    serie: s.serie,
    desde: s.desde,
    hasta: s.hasta,
    fechaAutorizacion: s.created_at,
    fechaVencimiento: s.fecha_vencimiento,
    estado,
  };
});
      setSeries(seriesFormateadas)
    } catch (error) {
      console.error("[v0] Error loading series:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgregarSerie = async () => {
    try {
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501" // TODO: Get from auth

      await ncfService.createSerieNCF(empresaId, {
  tipo_comprobante: nuevaSerie.tipo as "B01" | "B02" | "B14" | "B15" | "B16",
  secuencia_desde: Number.parseInt(nuevaSerie.desde),
  secuencia_hasta: Number.parseInt(nuevaSerie.hasta),
  secuencia_actual: Number.parseInt(nuevaSerie.desde),
  fecha_vencimiento: nuevaSerie.fechaVencimiento,
  activa: true,
})

      await loadSeries()

      setIsDialogOpen(false)
      setNuevaSerie({
        tipo: "",
        descripcion: "",
        serie: "",
        desde: "",
        hasta: "",
        fechaAutorizacion: "",
        fechaVencimiento: "",
      })
    } catch (error) {
      console.error("[v0] Error adding serie:", error)
    }
  }

  const handleDeleteSerie = async (serieId: string) => {
    try {
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501" // TODO: Get from auth
      await ncfService.deleteSerieNCF(serieId, empresaId)
      await loadSeries()
    } catch (error) {
      console.error("[v0] Error deleting serie:", error)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activa":
        return <Badge variant="default">Activa</Badge>
      case "Vencida":
        return <Badge variant="destructive">Vencida</Badge>
      case "Agotada":
        return <Badge variant="secondary">Agotada</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Mantenimiento de Series Fiscales</h1>
                <p className="text-muted-foreground">Gestión de series autorizadas por la DGII</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Serie
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Serie Fiscal</DialogTitle>
                    <DialogDescription>Registre una nueva serie autorizada por la DGII</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Comprobante</Label>
                        <Select
                          value={nuevaSerie.tipo}
                          onValueChange={(value) => setNuevaSerie({ ...nuevaSerie, tipo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="01">01 - Crédito Fiscal</SelectItem>
                            <SelectItem value="02">02 - Consumo</SelectItem>
                            <SelectItem value="14">14 - Régimen Especial</SelectItem>
                            <SelectItem value="15">15 - Gubernamental</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serie">Serie</Label>
                        <Input
                          id="serie"
                          placeholder="Ej: B01"
                          value={nuevaSerie.serie}
                          onChange={(e) => setNuevaSerie({ ...nuevaSerie, serie: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Input
                        id="descripcion"
                        placeholder="Descripción de la serie"
                        value={nuevaSerie.descripcion}
                        onChange={(e) => setNuevaSerie({ ...nuevaSerie, descripcion: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="desde">Desde</Label>
                        <Input
                          id="desde"
                          type="number"
                          placeholder="1"
                          value={nuevaSerie.desde}
                          onChange={(e) => setNuevaSerie({ ...nuevaSerie, desde: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hasta">Hasta</Label>
                        <Input
                          id="hasta"
                          type="number"
                          placeholder="10000"
                          value={nuevaSerie.hasta}
                          onChange={(e) => setNuevaSerie({ ...nuevaSerie, hasta: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fechaAutorizacion">Fecha de Autorización</Label>
                        <Input
                          id="fechaAutorizacion"
                          type="date"
                          value={nuevaSerie.fechaAutorizacion}
                          onChange={(e) => setNuevaSerie({ ...nuevaSerie, fechaAutorizacion: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                        <Input
                          id="fechaVencimiento"
                          type="date"
                          value={nuevaSerie.fechaVencimiento}
                          onChange={(e) => setNuevaSerie({ ...nuevaSerie, fechaVencimiento: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAgregarSerie}>Guardar Serie</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Series Activas</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{series.filter((s) => s.estado === "Activa").length}</div>
                  <p className="text-xs text-muted-foreground">En uso actualmente</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Series Vencidas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{series.filter((s) => s.estado === "Vencida").length}</div>
                  <p className="text-xs text-muted-foreground">Requieren renovación</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Series</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{series.length}</div>
                  <p className="text-xs text-muted-foreground">Registradas en el sistema</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Series Fiscales Registradas</CardTitle>
                <CardDescription>Listado de todas las series autorizadas por la DGII</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-muted-foreground">Cargando series...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Serie</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Rango</TableHead>
                        <TableHead>Autorización</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {series.map((serie) => (
                        <TableRow key={serie.id}>
                          <TableCell className="font-medium">{serie.tipo}</TableCell>
                          <TableCell>{serie.serie}</TableCell>
                          <TableCell>{serie.descripcion}</TableCell>
                          <TableCell>
                            {serie.desde.toString().padStart(8, "0")} - {serie.hasta.toString().padStart(8, "0")}
                          </TableCell>
                          <TableCell>{new Date(serie.fechaAutorizacion).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(serie.fechaVencimiento).toLocaleDateString()}</TableCell>
                          <TableCell>{getEstadoBadge(serie.estado)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteSerie(serie.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Información sobre Series Fiscales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-800">
                <p>
                  Las series fiscales deben ser autorizadas por la DGII antes de su uso. Cada serie tiene una vigencia
                  de 2 años desde su autorización.
                </p>
                <p>
                  <strong>Importante:</strong> Debe solicitar nuevas series con anticipación antes de que se agoten o
                  venzan las actuales.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
