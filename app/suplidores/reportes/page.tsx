"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Filter, Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function ReportesCuentasPorPagar() {
  const [filtros, setFiltros] = useState({
    tipoSuplidor: "",
    fechaFacturacionDesde: "",
    fechaFacturacionHasta: "",
    fechaCaducidadDesde: "",
    fechaCaducidadHasta: "",
    antiguedadDesde: "",
    antiguedadHasta: "",
    facturasSaldadas: false,
    conPagos: false,
    conITBIS: false,
    conRetenciones: false,
  })

  const [resultados, setResultados] = useState([
    {
      id: 1,
      orden: "OC-2024-001",
      suplidor: "Distribuidora Nacional SRL",
      tipoSuplidor: "Mayorista",
      fechaFactura: "2024-01-10",
      fechaVencimiento: "2024-02-10",
      antiguedad: 50,
      monto: 250000,
      pagado: 100000,
      saldo: 150000,
      itbis: 45000,
      retencion: 5000,
      estado: "Vencida",
    },
    {
      id: 2,
      orden: "OC-2024-002",
      suplidor: "Importadora del Caribe",
      tipoSuplidor: "Importador",
      fechaFactura: "2024-02-15",
      fechaVencimiento: "2024-03-15",
      antiguedad: 15,
      monto: 180000,
      pagado: 180000,
      saldo: 0,
      itbis: 32400,
      retencion: 3600,
      estado: "Saldada",
    },
    {
      id: 3,
      orden: "OC-2024-003",
      suplidor: "Proveedor Local SA",
      tipoSuplidor: "Local",
      fechaFactura: "2024-03-05",
      fechaVencimiento: "2024-04-05",
      antiguedad: 0,
      monto: 95000,
      pagado: 0,
      saldo: 95000,
      itbis: 17100,
      retencion: 1900,
      estado: "Pendiente",
    },
  ])

  const handleFiltrar = () => {
    console.log("[v0] Aplicando filtros:", filtros)
  }

  const handleExportar = (formato: string) => {
    console.log("[v0] Exportando reporte en formato:", formato)
  }

  const totales = {
    monto: resultados.reduce((sum, r) => sum + r.monto, 0),
    pagado: resultados.reduce((sum, r) => sum + r.pagado, 0),
    saldo: resultados.reduce((sum, r) => sum + r.saldo, 0),
    itbis: resultados.reduce((sum, r) => sum + r.itbis, 0),
    retencion: resultados.reduce((sum, r) => sum + r.retencion, 0),
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Reporte de Cuentas por Pagar</h1>
            <p className="text-muted-foreground">Filtre y analice las cuentas por pagar con múltiples criterios</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </CardTitle>
              <CardDescription>Seleccione los criterios para filtrar el reporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="tipoSuplidor">Tipo de Suplidor</Label>
                  <Select
                    value={filtros.tipoSuplidor}
                    onValueChange={(value) => setFiltros({ ...filtros, tipoSuplidor: value })}
                  >
                    <SelectTrigger id="tipoSuplidor">
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="mayorista">Mayorista</SelectItem>
                      <SelectItem value="importador">Importador</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="internacional">Internacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFactDesde">Fecha Facturación Desde</Label>
                  <Input
                    id="fechaFactDesde"
                    type="date"
                    value={filtros.fechaFacturacionDesde}
                    onChange={(e) => setFiltros({ ...filtros, fechaFacturacionDesde: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFactHasta">Fecha Facturación Hasta</Label>
                  <Input
                    id="fechaFactHasta"
                    type="date"
                    value={filtros.fechaFacturacionHasta}
                    onChange={(e) => setFiltros({ ...filtros, fechaFacturacionHasta: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaCadDesde">Fecha Caducidad Desde</Label>
                  <Input
                    id="fechaCadDesde"
                    type="date"
                    value={filtros.fechaCaducidadDesde}
                    onChange={(e) => setFiltros({ ...filtros, fechaCaducidadDesde: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaCadHasta">Fecha Caducidad Hasta</Label>
                  <Input
                    id="fechaCadHasta"
                    type="date"
                    value={filtros.fechaCaducidadHasta}
                    onChange={(e) => setFiltros({ ...filtros, fechaCaducidadHasta: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="antiguedadDesde">Antigüedad Desde (días)</Label>
                  <Input
                    id="antiguedadDesde"
                    type="number"
                    placeholder="0"
                    value={filtros.antiguedadDesde}
                    onChange={(e) => setFiltros({ ...filtros, antiguedadDesde: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="antiguedadHasta">Antigüedad Hasta (días)</Label>
                  <Input
                    id="antiguedadHasta"
                    type="number"
                    placeholder="365"
                    value={filtros.antiguedadHasta}
                    onChange={(e) => setFiltros({ ...filtros, antiguedadHasta: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Label>Opciones Adicionales</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saldadas"
                      checked={filtros.facturasSaldadas}
                      onCheckedChange={(checked) => setFiltros({ ...filtros, facturasSaldadas: checked as boolean })}
                    />
                    <label
                      htmlFor="saldadas"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Incluir Facturas Saldadas
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pagos"
                      checked={filtros.conPagos}
                      onCheckedChange={(checked) => setFiltros({ ...filtros, conPagos: checked as boolean })}
                    />
                    <label
                      htmlFor="pagos"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Solo con Pagos Realizados
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label>Filtros Fiscales</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="itbis"
                      checked={filtros.conITBIS}
                      onCheckedChange={(checked) => setFiltros({ ...filtros, conITBIS: checked as boolean })}
                    />
                    <label
                      htmlFor="itbis"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Con ITBIS Facturado
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="retenciones"
                      checked={filtros.conRetenciones}
                      onCheckedChange={(checked) => setFiltros({ ...filtros, conRetenciones: checked as boolean })}
                    />
                    <label
                      htmlFor="retenciones"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Con Retenciones Realizadas
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleFiltrar} className="gap-2">
                  <Search className="h-4 w-4" />
                  Aplicar Filtros
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFiltros({
                      tipoSuplidor: "",
                      fechaFacturacionDesde: "",
                      fechaFacturacionHasta: "",
                      fechaCaducidadDesde: "",
                      fechaCaducidadHasta: "",
                      antiguedadDesde: "",
                      antiguedadHasta: "",
                      facturasSaldadas: false,
                      conPagos: false,
                      conITBIS: false,
                      conRetenciones: false,
                    })
                  }
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resultados del Reporte</CardTitle>
                  <CardDescription>{resultados.length} órdenes encontradas</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportar("excel")} className="gap-2">
                    <Download className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportar("pdf")} className="gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Suplidor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha Factura</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Antigüedad</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Pagado</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="text-right">ITBIS</TableHead>
                      <TableHead className="text-right">Retención</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultados.map((resultado) => (
                      <TableRow key={resultado.id}>
                        <TableCell className="font-medium">{resultado.orden}</TableCell>
                        <TableCell>{resultado.suplidor}</TableCell>
                        <TableCell>{resultado.tipoSuplidor}</TableCell>
                        <TableCell>{resultado.fechaFactura}</TableCell>
                        <TableCell>{resultado.fechaVencimiento}</TableCell>
                        <TableCell>{resultado.antiguedad} días</TableCell>
                        <TableCell className="text-right">${resultado.monto.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${resultado.pagado.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">${resultado.saldo.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${resultado.itbis.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${resultado.retencion.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              resultado.estado === "Saldada"
                                ? "default"
                                : resultado.estado === "Vencida"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {resultado.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={6}>TOTALES</TableCell>
                      <TableCell className="text-right">${totales.monto.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${totales.pagado.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${totales.saldo.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${totales.itbis.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${totales.retencion.toLocaleString()}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
