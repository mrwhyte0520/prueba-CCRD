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
import { FileText, Download, DollarSign } from "lucide-react"

interface Retencion623 {
  id: string
  fecha: string
  proveedor: string
  rnc: string
  ncf: string
  montoFactura: number
  montoRetenido: number
  tipoRetencion: string
}

const mockRetenciones: Retencion623[] = [
  {
    id: "1",
    fecha: "2024-01-15",
    proveedor: "Servicios Profesionales ABC",
    rnc: "131234567",
    ncf: "B0100000123",
    montoFactura: 50000,
    montoRetenido: 5000,
    tipoRetencion: "ISR 10%",
  },
  {
    id: "2",
    fecha: "2024-01-18",
    proveedor: "Consultoría XYZ SRL",
    rnc: "131234568",
    ncf: "B0100000124",
    montoFactura: 75000,
    montoRetenido: 7500,
    tipoRetencion: "ISR 10%",
  },
  {
    id: "3",
    fecha: "2024-01-22",
    proveedor: "Alquileres del Este",
    rnc: "131234569",
    ncf: "B0100000125",
    montoFactura: 30000,
    montoRetenido: 3000,
    tipoRetencion: "ISR 10%",
  },
]

export default function Reporte623Page() {
  const [periodo, setPeriodo] = useState("2024-01")
  const [retenciones] = useState<Retencion623[]>(mockRetenciones)

  const totalFacturas = retenciones.reduce((sum, r) => sum + r.montoFactura, 0)
  const totalRetenido = retenciones.reduce((sum, r) => sum + r.montoRetenido, 0)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Reporte 623</h1>
                <p className="text-muted-foreground">Retenciones de ISR por Pagos a Proveedores del Estado</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar TXT
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
                    <Label htmlFor="rnc">RNC Declarante</Label>
                    <Input id="rnc" value="123456789" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razon">Razón Social</Label>
                    <Input id="razon" value="Mi Empresa SRL" readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Retenciones</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retenciones.length}</div>
                  <p className="text-xs text-muted-foreground">Operaciones registradas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monto Total Facturas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalFacturas.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Base de retención</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Retenido</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">RD$ {totalRetenido.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">A pagar a la DGII</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalle de Retenciones</CardTitle>
                <CardDescription>Retenciones de ISR realizadas en el período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>RNC</TableHead>
                      <TableHead>NCF</TableHead>
                      <TableHead className="text-right">Monto Factura</TableHead>
                      <TableHead className="text-right">Monto Retenido</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retenciones.map((retencion) => (
                      <TableRow key={retencion.id}>
                        <TableCell>{new Date(retencion.fecha).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{retencion.proveedor}</TableCell>
                        <TableCell>{retencion.rnc}</TableCell>
                        <TableCell>{retencion.ncf}</TableCell>
                        <TableCell className="text-right">RD$ {retencion.montoFactura.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          RD$ {retencion.montoRetenido.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{retencion.tipoRetencion}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Información sobre el Formulario 623</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-800">
                <p>
                  El Formulario 623 se utiliza para declarar las retenciones de ISR realizadas por pagos a proveedores
                  del Estado Dominicano.
                </p>
                <p>
                  <strong>Plazo de presentación:</strong> Dentro de los primeros 10 días del mes siguiente al período
                  declarado.
                </p>
                <p>
                  <strong>Tipos de retención:</strong> ISR 10% sobre servicios profesionales, alquileres y otros
                  servicios.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
