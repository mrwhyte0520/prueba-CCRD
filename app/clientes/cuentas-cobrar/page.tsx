"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import * as cuentasCobrarService from "@/lib/services/cuentas-cobrar.service"

export default function CuentasPorCobrarPage() {
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("todos")
  const [cuentas, setCuentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCuentas()
  }, [])

  const loadCuentas = async () => {
    try {
      setLoading(true)
      const data = await cuentasCobrarService.getAllCuentasCobrar()
      setCuentas(data)
    } catch (error) {
      console.error("[v0] Error loading cuentas:", error)
    } finally {
      setLoading(false)
    }
  }

  const cuentasFiltradas = cuentas.filter((cuenta) => {
    const matchBusqueda =
      cuenta.facturas?.numero_factura?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cuenta.clientes?.nombre?.toLowerCase().includes(busqueda.toLowerCase())

    const matchEstado = estadoFiltro === "todos" || cuenta.estado === estadoFiltro

    return matchBusqueda && matchEstado
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>
      case "parcial":
        return <Badge className="bg-primary text-primary-foreground">Parcial</Badge>
      case "vencida":
        return <Badge variant="destructive">Vencida</Badge>
      case "pagada":
        return <Badge className="bg-success text-success-foreground">Pagada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const totalPendiente = cuentasFiltradas.reduce((sum, cuenta) => sum + (cuenta.balance || 0), 0)
  const totalVencido = cuentasFiltradas
    .filter((c) => c.estado === "vencida")
    .reduce((sum, cuenta) => sum + (cuenta.balance || 0), 0)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Cuentas por Cobrar</h1>
              <p className="text-muted-foreground">Gestión de cartera y cobros</p>
            </div>
            <Button asChild>
              <Link href="/clientes/reportes">
                <FileText className="mr-2 h-4 w-4" />
                Reporte de Antigüedad
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total por Cobrar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RD$ {totalPendiente.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{cuentasFiltradas.length} facturas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vencido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">RD$ {totalVencido.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cuentasFiltradas.filter((c) => c.estado === "vencida").length} facturas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Por Vencer (30 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  RD${" "}
                  {cuentasFiltradas
                    .filter((c) => c.estado === "pendiente")
                    .reduce((sum, c) => sum + (c.balance || 0), 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cuentasFiltradas.filter((c) => c.estado === "pendiente").length} facturas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pagos Parciales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RD${" "}
                  {cuentasFiltradas
                    .filter((c) => c.estado === "parcial")
                    .reduce((sum, c) => sum + (c.balance || 0), 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cuentasFiltradas.filter((c) => c.estado === "parcial").length} facturas
                </p>
              </CardContent>
            </Card>
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
                      placeholder="Buscar por factura o cliente..."
                      className="pl-10"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full space-y-2 md:w-48">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                    <SelectTrigger id="estado">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="parcial">Parcial</SelectItem>
                      <SelectItem value="vencida">Vencida</SelectItem>
                      <SelectItem value="pagada">Pagada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Cuentas por Cobrar</CardTitle>
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
                      <TableHead>Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Días Vencido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cuentasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No se encontraron cuentas
                        </TableCell>
                      </TableRow>
                    ) : (
                      cuentasFiltradas.map((cuenta) => (
                        <TableRow key={cuenta.id}>
                          <TableCell className="font-mono text-sm">
                            {cuenta.facturas?.numero_factura || "N/A"}
                          </TableCell>
                          <TableCell className="font-medium">{cuenta.clientes?.nombre || "N/A"}</TableCell>
                          <TableCell>
                            {cuenta.fecha_factura ? new Date(cuenta.fecha_factura).toLocaleDateString("es-DO") : "N/A"}
                          </TableCell>
                          <TableCell>
                            {cuenta.fecha_vencimiento
                              ? new Date(cuenta.fecha_vencimiento).toLocaleDateString("es-DO")
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            RD$ {(cuenta.monto_original || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            RD$ {(cuenta.balance || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>{getEstadoBadge(cuenta.estado)}</TableCell>
                          <TableCell className="text-right">
                            {cuenta.dias_vencido > 0 ? (
                              <span className="font-medium text-destructive">{cuenta.dias_vencido} días</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
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
        </main>
      </div>
    </div>
  )
}
