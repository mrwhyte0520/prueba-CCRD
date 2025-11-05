"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Printer, FileDown } from "lucide-react"

export default function RecibosEgresosPage() {
  const [recibos, setRecibos] = useState([
    {
      id: 1,
      numero: "RE-2024-001",
      fecha: "2024-01-15",
      beneficiario: "Distribuidora Nacional",
      concepto: "Pago Orden de Compra #OC-001",
      monto: 50000,
      metodoPago: "Transferencia",
      estado: "Emitido",
    },
    {
      id: 2,
      numero: "RE-2024-002",
      fecha: "2024-01-16",
      beneficiario: "Servicios Eléctricos",
      concepto: "Pago de Electricidad",
      monto: 8500,
      metodoPago: "Cheque",
      estado: "Emitido",
    },
    {
      id: 3,
      numero: "RE-2024-003",
      fecha: "2024-01-17",
      beneficiario: "Alquiler de Local",
      concepto: "Renta Mensual Enero 2024",
      monto: 25000,
      metodoPago: "Transferencia",
      estado: "Emitido",
    },
  ])

  const [nuevoRecibo, setNuevoRecibo] = useState({
    beneficiario: "",
    concepto: "",
    monto: "",
    metodoPago: "",
    referencia: "",
    notas: "",
  })

  const handleCrearRecibo = () => {
    const recibo = {
      id: recibos.length + 1,
      numero: `RE-2024-${String(recibos.length + 1).padStart(3, "0")}`,
      fecha: new Date().toISOString().split("T")[0],
      beneficiario: nuevoRecibo.beneficiario,
      concepto: nuevoRecibo.concepto,
      monto: Number.parseFloat(nuevoRecibo.monto),
      metodoPago: nuevoRecibo.metodoPago,
      estado: "Emitido",
    }
    setRecibos([...recibos, recibo])
    setNuevoRecibo({
      beneficiario: "",
      concepto: "",
      monto: "",
      metodoPago: "",
      referencia: "",
      notas: "",
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Recibos de Egresos</h1>
                <p className="text-muted-foreground">Gestiona los recibos de salidas de efectivo</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Recibo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Recibo de Egreso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Beneficiario</Label>
                        <Select
                          value={nuevoRecibo.beneficiario}
                          onValueChange={(value) => setNuevoRecibo({ ...nuevoRecibo, beneficiario: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar beneficiario" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Distribuidora Nacional">Distribuidora Nacional</SelectItem>
                            <SelectItem value="Servicios Eléctricos">Servicios Eléctricos</SelectItem>
                            <SelectItem value="Alquiler de Local">Alquiler de Local</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Monto (RD$)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={nuevoRecibo.monto}
                          onChange={(e) => setNuevoRecibo({ ...nuevoRecibo, monto: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Concepto</Label>
                      <Input
                        placeholder="Descripción del egreso"
                        value={nuevoRecibo.concepto}
                        onChange={(e) => setNuevoRecibo({ ...nuevoRecibo, concepto: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Método de Pago</Label>
                        <Select
                          value={nuevoRecibo.metodoPago}
                          onValueChange={(value) => setNuevoRecibo({ ...nuevoRecibo, metodoPago: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Referencia</Label>
                        <Input
                          placeholder="Número de referencia"
                          value={nuevoRecibo.referencia}
                          onChange={(e) => setNuevoRecibo({ ...nuevoRecibo, referencia: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Notas</Label>
                      <Textarea
                        placeholder="Notas adicionales"
                        value={nuevoRecibo.notas}
                        onChange={(e) => setNuevoRecibo({ ...nuevoRecibo, notas: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancelar</Button>
                      <Button onClick={handleCrearRecibo}>Crear Recibo</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filtros de Búsqueda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Número de Recibo</Label>
                    <Input placeholder="RE-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Beneficiario</Label>
                    <Input placeholder="Buscar beneficiario" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Desde</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Hasta</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recibos Emitidos</CardTitle>
                    <CardDescription>Lista de todos los recibos de egresos</CardDescription>
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
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recibos.map((recibo) => (
                      <TableRow key={recibo.id}>
                        <TableCell className="font-medium">{recibo.numero}</TableCell>
                        <TableCell>{recibo.fecha}</TableCell>
                        <TableCell>{recibo.beneficiario}</TableCell>
                        <TableCell>{recibo.concepto}</TableCell>
                        <TableCell>{recibo.metodoPago}</TableCell>
                        <TableCell className="text-right">RD$ {recibo.monto.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="default">{recibo.estado}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                            <Button variant="ghost" size="sm">
                              Imprimir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
