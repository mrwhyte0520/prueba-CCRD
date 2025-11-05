"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FileText, Download, Upload, Plus, Trash2, Search } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import * as impuestosService from "@/lib/services/impuestos.service"

interface Compra {
  id: string
  rnc: string
  tipoComprobante: string
  ncf: string
  fecha: string
  proveedor: string
  montoGravado: number
  itbis: number
  total: number
}

export default function Form606Page() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [periodo, setPeriodo] = useState("2024-03")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newCompra, setNewCompra] = useState({
    rnc: "",
    tipoComprobante: "",
    ncf: "",
    fecha: "",
    proveedor: "",
    montoGravado: "",
    itbis: "",
  })

  useEffect(() => {
    loadCompras()
  }, [periodo])

  const loadCompras = async () => {
    try {
      setLoading(true)
      const [year, month] = periodo.split("-")
      const data = await impuestosService.getReporte606(Number.parseInt(year), Number.parseInt(month))
      setCompras(
        data.map((item) => ({
          id: item.id,
          rnc: item.rnc_proveedor,
          tipoComprobante: item.tipo_comprobante,
          ncf: item.ncf,
          fecha: item.fecha_comprobante,
          proveedor: item.nombre_proveedor,
          montoGravado: item.monto_facturado,
          itbis: item.itbis_facturado,
          total: item.monto_facturado + item.itbis_facturado,
        })),
      )
    } catch (error) {
      console.error("Error loading 606:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompras = compras.filter(
    (compra) =>
      compra.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.rnc.includes(searchTerm) ||
      compra.ncf.includes(searchTerm),
  )

  const totalMontoGravado = compras.reduce((sum, c) => sum + c.montoGravado, 0)
  const totalITBIS = compras.reduce((sum, c) => sum + c.itbis, 0)
  const totalGeneral = compras.reduce((sum, c) => sum + c.total, 0)

  const handleAddCompra = async () => {
    try {
      const montoGravado = Number.parseFloat(newCompra.montoGravado) || 0
      const itbis = Number.parseFloat(newCompra.itbis) || 0

      await impuestosService.createReporte606({
        rnc_proveedor: newCompra.rnc,
        tipo_comprobante: newCompra.tipoComprobante,
        ncf: newCompra.ncf,
        fecha_comprobante: newCompra.fecha,
        nombre_proveedor: newCompra.proveedor,
        monto_facturado: montoGravado,
        itbis_facturado: itbis,
      })

      await loadCompras()
      setIsDialogOpen(false)
      setNewCompra({
        rnc: "",
        tipoComprobante: "",
        ncf: "",
        fecha: "",
        proveedor: "",
        montoGravado: "",
        itbis: "",
      })
    } catch (error) {
      console.error("Error adding compra:", error)
      alert("Error al agregar la compra")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando reporte 606...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Formulario 606</h1>
                <p className="text-muted-foreground">Declaración Informativa de Compras</p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="month"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-[180px]"
                />
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Excel
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{compras.length}</div>
                  <p className="text-xs text-muted-foreground">Registros</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monto Gravado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalMontoGravado.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Base imponible</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ITBIS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalITBIS.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total impuesto</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RD$ {totalGeneral.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Incluye ITBIS</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Detalle de Compras</CardTitle>
                    <CardDescription>Registro de todas las compras del período</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-[250px]"
                      />
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Compra
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left text-sm font-medium">RNC</th>
                          <th className="p-3 text-left text-sm font-medium">Tipo</th>
                          <th className="p-3 text-left text-sm font-medium">NCF</th>
                          <th className="p-3 text-left text-sm font-medium">Fecha</th>
                          <th className="p-3 text-left text-sm font-medium">Proveedor</th>
                          <th className="p-3 text-right text-sm font-medium">Monto Gravado</th>
                          <th className="p-3 text-right text-sm font-medium">ITBIS</th>
                          <th className="p-3 text-right text-sm font-semibold">Total</th>
                          <th className="p-3 text-center text-sm font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompras.map((compra) => (
                          <tr key={compra.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-sm font-mono">{compra.rnc}</td>
                            <td className="p-3 text-sm">
                              <Badge variant="outline">{compra.tipoComprobante}</Badge>
                            </td>
                            <td className="p-3 text-sm font-mono">{compra.ncf}</td>
                            <td className="p-3 text-sm">{new Date(compra.fecha).toLocaleDateString()}</td>
                            <td className="p-3 text-sm">{compra.proveedor}</td>
                            <td className="p-3 text-right text-sm">RD$ {compra.montoGravado.toLocaleString()}</td>
                            <td className="p-3 text-right text-sm font-medium">RD$ {compra.itbis.toLocaleString()}</td>
                            <td className="p-3 text-right text-sm font-semibold">
                              RD$ {compra.total.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-muted font-semibold">
                          <td colSpan={5} className="p-3 text-sm">
                            TOTALES
                          </td>
                          <td className="p-3 text-right text-sm">RD$ {totalMontoGravado.toLocaleString()}</td>
                          <td className="p-3 text-right text-sm">RD$ {totalITBIS.toLocaleString()}</td>
                          <td className="p-3 text-right text-sm">RD$ {totalGeneral.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar TXT
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generar PDF
              </Button>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Compra</DialogTitle>
            <DialogDescription>Ingrese los datos de la compra para el formulario 606</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rnc">RNC del Proveedor</Label>
                <Input
                  id="rnc"
                  placeholder="101234567"
                  value={newCompra.rnc}
                  onChange={(e) => setNewCompra({ ...newCompra, rnc: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoComprobante">Tipo de Comprobante</Label>
                <Input
                  id="tipoComprobante"
                  placeholder="01"
                  value={newCompra.tipoComprobante}
                  onChange={(e) => setNewCompra({ ...newCompra, tipoComprobante: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ncf">NCF</Label>
                <Input
                  id="ncf"
                  placeholder="B0100000123"
                  value={newCompra.ncf}
                  onChange={(e) => setNewCompra({ ...newCompra, ncf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={newCompra.fecha}
                  onChange={(e) => setNewCompra({ ...newCompra, fecha: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proveedor">Nombre del Proveedor</Label>
              <Input
                id="proveedor"
                placeholder="Distribuidora ABC SRL"
                value={newCompra.proveedor}
                onChange={(e) => setNewCompra({ ...newCompra, proveedor: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montoGravado">Monto Gravado</Label>
                <Input
                  id="montoGravado"
                  type="number"
                  placeholder="50000"
                  value={newCompra.montoGravado}
                  onChange={(e) => setNewCompra({ ...newCompra, montoGravado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itbis">ITBIS</Label>
                <Input
                  id="itbis"
                  type="number"
                  placeholder="9000"
                  value={newCompra.itbis}
                  onChange={(e) => setNewCompra({ ...newCompra, itbis: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCompra}>Agregar Compra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
