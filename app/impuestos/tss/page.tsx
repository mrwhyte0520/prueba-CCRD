"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Users } from "lucide-react"

interface NovedadTSS {
  id: string
  empleado: string
  cedula: string
  tipoNovedad: string
  fechaInicio: string
  fechaFin: string
  salario: number
  estado: "Activa" | "Procesada" | "Pendiente"
}

const mockNovedades: NovedadTSS[] = [
  {
    id: "1",
    empleado: "Juan Pérez",
    cedula: "001-1234567-8",
    tipoNovedad: "Ingreso",
    fechaInicio: "2024-01-15",
    fechaFin: "",
    salario: 35000,
    estado: "Procesada",
  },
  {
    id: "2",
    empleado: "María García",
    cedula: "001-2345678-9",
    tipoNovedad: "Aumento Salarial",
    fechaInicio: "2024-01-20",
    fechaFin: "",
    salario: 45000,
    estado: "Procesada",
  },
  {
    id: "3",
    empleado: "Pedro Martínez",
    cedula: "001-3456789-0",
    tipoNovedad: "Suspensión",
    fechaInicio: "2024-01-25",
    fechaFin: "2024-02-25",
    salario: 30000,
    estado: "Activa",
  },
]

export default function NovedadesTSSPage() {
  const [periodo, setPeriodo] = useState("2024-01")
  const [novedades] = useState<NovedadTSS[]>(mockNovedades)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activa":
        return <Badge variant="default">Activa</Badge>
      case "Procesada":
        return <Badge className="bg-green-600">Procesada</Badge>
      case "Pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      default:
        return null
    }
  }

  const getTipoNovedadBadge = (tipo: string) => {
    switch (tipo) {
      case "Ingreso":
        return <Badge className="bg-blue-600">Ingreso</Badge>
      case "Egreso":
        return <Badge variant="destructive">Egreso</Badge>
      case "Aumento Salarial":
        return <Badge className="bg-green-600">Aumento</Badge>
      case "Suspensión":
        return <Badge className="bg-yellow-600">Suspensión</Badge>
      default:
        return <Badge variant="secondary">{tipo}</Badge>
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
                <h1 className="text-3xl font-bold">Novedades de la TSS</h1>
                <p className="text-muted-foreground">Gestión de novedades para la Tesorería de la Seguridad Social</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Archivo
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Período de Declaración</CardTitle>
                <CardDescription>Seleccione el mes a declarar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <Input id="periodo" type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rnc">RNC Empleador</Label>
                    <Input id="rnc" value="123456789" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razon">Razón Social</Label>
                    <Input id="razon" value="Mi Empresa SRL" readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Novedades</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{novedades.length}</div>
                  <p className="text-xs text-muted-foreground">En el período</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {novedades.filter((n) => n.tipoNovedad === "Ingreso").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Nuevos empleados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Egresos</CardTitle>
                  <Users className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{novedades.filter((n) => n.tipoNovedad === "Egreso").length}</div>
                  <p className="text-xs text-muted-foreground">Empleados retirados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Otras Novedades</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {novedades.filter((n) => n.tipoNovedad !== "Ingreso" && n.tipoNovedad !== "Egreso").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Cambios y ajustes</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalle de Novedades</CardTitle>
                <CardDescription>Listado de novedades registradas en el período</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Cédula</TableHead>
                      <TableHead>Tipo de Novedad</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Fecha Fin</TableHead>
                      <TableHead className="text-right">Salario</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {novedades.map((novedad) => (
                      <TableRow key={novedad.id}>
                        <TableCell className="font-medium">{novedad.empleado}</TableCell>
                        <TableCell>{novedad.cedula}</TableCell>
                        <TableCell>{getTipoNovedadBadge(novedad.tipoNovedad)}</TableCell>
                        <TableCell>{new Date(novedad.fechaInicio).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {novedad.fechaFin ? new Date(novedad.fechaFin).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">RD$ {novedad.salario.toLocaleString()}</TableCell>
                        <TableCell>{getEstadoBadge(novedad.estado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Información sobre Novedades TSS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-800">
                <p>
                  Las novedades de la TSS deben reportarse mensualmente para mantener actualizada la información de los
                  empleados en el sistema de seguridad social.
                </p>
                <p>
                  <strong>Tipos de novedades:</strong> Ingresos, egresos, aumentos salariales, suspensiones, licencias,
                  cambios de cargo, entre otros.
                </p>
                <p>
                  <strong>Plazo de presentación:</strong> Dentro de los primeros 10 días del mes siguiente al período
                  declarado.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
