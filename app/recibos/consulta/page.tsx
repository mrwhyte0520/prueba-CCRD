"use client"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Printer, FileDown, Eye } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConsultaRecibosPage() {
  const recibosIngresos = [
    {
      id: 1,
      numero: "RI-2024-001",
      fecha: "2024-01-15",
      cliente: "Supermercado La Económica",
      concepto: "Pago Factura #FAC-001",
      monto: 25000,
      tipo: "Ingreso",
    },
    {
      id: 2,
      numero: "RI-2024-002",
      fecha: "2024-01-16",
      cliente: "Farmacia San Rafael",
      concepto: "Pago Factura #FAC-005",
      monto: 15000,
      tipo: "Ingreso",
    },
  ]

  const recibosEgresos = [
    {
      id: 1,
      numero: "RE-2024-001",
      fecha: "2024-01-15",
      beneficiario: "Distribuidora Nacional",
      concepto: "Pago Orden de Compra #OC-001",
      monto: 50000,
      tipo: "Egreso",
    },
    {
      id: 2,
      numero: "RE-2024-002",
      fecha: "2024-01-16",
      beneficiario: "Servicios Eléctricos",
      concepto: "Pago de Electricidad",
      monto: 8500,
      tipo: "Egreso",
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Consulta de Recibos</h1>
              <p className="text-muted-foreground">Busca y consulta todos los recibos emitidos</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filtros de Búsqueda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Número de Recibo</Label>
                    <Input placeholder="RI-2024-001 o RE-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Recibo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ingreso">Ingresos</SelectItem>
                        <SelectItem value="egreso">Egresos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Desde</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Hasta</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cliente/Beneficiario</Label>
                    <Input placeholder="Buscar..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Mínimo</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Máximo</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="ingresos" className="space-y-4">
              <TabsList>
                <TabsTrigger value="ingresos">Recibos de Ingresos</TabsTrigger>
                <TabsTrigger value="egresos">Recibos de Egresos</TabsTrigger>
                <TabsTrigger value="todos">Todos los Recibos</TabsTrigger>
              </TabsList>

              <TabsContent value="ingresos">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recibos de Ingresos</CardTitle>
                        <CardDescription>
                          Total: RD$ {recibosIngresos.reduce((sum, r) => sum + r.monto, 0).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileDown className="mr-2 h-4 w-4" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recibosIngresos.map((recibo) => (
                          <TableRow key={recibo.id}>
                            <TableCell className="font-medium">{recibo.numero}</TableCell>
                            <TableCell>{recibo.fecha}</TableCell>
                            <TableCell>{recibo.cliente}</TableCell>
                            <TableCell>{recibo.concepto}</TableCell>
                            <TableCell className="text-right">RD$ {recibo.monto.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="egresos">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recibos de Egresos</CardTitle>
                        <CardDescription>
                          Total: RD$ {recibosEgresos.reduce((sum, r) => sum + r.monto, 0).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileDown className="mr-2 h-4 w-4" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Beneficiario</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recibosEgresos.map((recibo) => (
                          <TableRow key={recibo.id}>
                            <TableCell className="font-medium">{recibo.numero}</TableCell>
                            <TableCell>{recibo.fecha}</TableCell>
                            <TableCell>{recibo.beneficiario}</TableCell>
                            <TableCell>{recibo.concepto}</TableCell>
                            <TableCell className="text-right">RD$ {recibo.monto.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="todos">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Todos los Recibos</CardTitle>
                        <CardDescription>
                          Ingresos: RD$ {recibosIngresos.reduce((sum, r) => sum + r.monto, 0).toLocaleString()} |
                          Egresos: RD$ {recibosEgresos.reduce((sum, r) => sum + r.monto, 0).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileDown className="mr-2 h-4 w-4" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Cliente/Beneficiario</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          ...recibosIngresos.map((r) => ({ ...r, cliente: r.cliente })),
                          ...recibosEgresos.map((r) => ({ ...r, cliente: r.beneficiario })),
                        ].map((recibo) => (
                          <TableRow key={`${recibo.tipo}-${recibo.id}`}>
                            <TableCell className="font-medium">{recibo.numero}</TableCell>
                            <TableCell>
                              <Badge variant={recibo.tipo === "Ingreso" ? "default" : "secondary"}>{recibo.tipo}</Badge>
                            </TableCell>
                            <TableCell>{recibo.fecha}</TableCell>
                            <TableCell>{recibo.cliente}</TableCell>
                            <TableCell>{recibo.concepto}</TableCell>
                            <TableCell className="text-right">RD$ {recibo.monto.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
