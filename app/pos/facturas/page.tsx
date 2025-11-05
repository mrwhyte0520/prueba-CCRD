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
import { Eye, Printer, FileText, Search, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import * as facturasService from "@/lib/services/facturas.service"

export default function FacturasPage() {
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("todos")
  const [facturas, setFacturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFacturas()
  }, [])

  const loadFacturas = async () => {
    try {
      setLoading(true)
      const data = await facturasService.getAllFacturas()
      setFacturas(data)
    } catch (error) {
      console.error("[v0] Error loading facturas:", error)
    } finally {
      setLoading(false)
    }
  }

  const facturasFiltradas = facturas.filter((factura) => {
    const matchBusqueda =
      factura.numero_factura?.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.clientes?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.ncf?.toLowerCase().includes(busqueda.toLowerCase())

    const matchEstado = estadoFiltro === "todos" || factura.estado === estadoFiltro

    return matchBusqueda && matchEstado
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pagada":
        return <Badge className="bg-success text-success-foreground">Pagada</Badge>
      case "pendiente":
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>
      case "anulada":
        return <Badge variant="destructive">Anulada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Facturas</h1>
              <p className="text-muted-foreground">Gestión de facturas emitidas</p>
            </div>
            <Button asChild>
              <Link href="/pos/nueva-factura">
                <FileText className="mr-2 h-4 w-4" />
                Nueva Factura
              </Link>
            </Button>
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
                      placeholder="Buscar por número, cliente o NCF..."
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
                      <SelectItem value="pagada">Pagada</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="anulada">Anulada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Más Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Facturas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>NCF</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">ITBIS</TableHead>
                    <TableHead className="text-right font-medium">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        Cargando facturas...
                      </TableCell>
                    </TableRow>
                  ) : facturasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No se encontraron facturas
                      </TableCell>
                    </TableRow>
                  ) : (
                    facturasFiltradas.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell className="font-medium">{factura.numero_factura}</TableCell>
                        <TableCell className="font-mono text-sm">{factura.ncf || "N/A"}</TableCell>
                        <TableCell>{new Date(factura.fecha).toLocaleDateString("es-DO")}</TableCell>
                        <TableCell>{factura.clientes?.nombre || "N/A"}</TableCell>
                        <TableCell className="text-right">RD$ {factura.subtotal?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right">RD$ {factura.itbis?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right font-medium">
                          RD$ {factura.total?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
