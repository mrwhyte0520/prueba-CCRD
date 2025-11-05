"use client"

import { useState, useEffect } from "react"
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
import { Loader2 } from "lucide-react"
import * as recibosService from "@/lib/services/recibos.service"
import { useToast } from "@/hooks/use-toast"

export default function RecibosIngresosPage() {
  const [recibos, setRecibos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [nuevoRecibo, setNuevoRecibo] = useState({
    beneficiario: "",
    concepto: "",
    monto: "",
    metodo_pago: "",
    referencia: "",
    notas: "",
  })

  useEffect(() => {
    loadRecibos()
  }, [])

  const loadRecibos = async () => {
    try {
      setLoading(true)
      const empresaId = "00000000-0000-0000-0000-000000000001" // TODO: Get from auth
      const data = await recibosService.getRecibos(empresaId, "ingreso")
      setRecibos(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los recibos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCrearRecibo = async () => {
    if (!nuevoRecibo.beneficiario || !nuevoRecibo.concepto || !nuevoRecibo.monto || !nuevoRecibo.metodo_pago) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const empresaId = "00000000-0000-0000-0000-000000000001" // TODO: Get from auth
      const numero = await recibosService.getNextNumeroRecibo(empresaId, "ingreso")

      await recibosService.createRecibo({
        empresa_id: empresaId,
        numero,
        tipo: "ingreso",
        fecha: new Date().toISOString().split("T")[0],
        beneficiario: nuevoRecibo.beneficiario,
        concepto: nuevoRecibo.concepto,
        monto: Number.parseFloat(nuevoRecibo.monto),
        metodo_pago: nuevoRecibo.metodo_pago,
        referencia: nuevoRecibo.referencia || undefined,
        notas: nuevoRecibo.notas || undefined,
      })

      toast({
        title: "Recibo creado",
        description: "El recibo se ha guardado correctamente",
      })

      setIsDialogOpen(false)
      setNuevoRecibo({
        beneficiario: "",
        concepto: "",
        monto: "",
        metodo_pago: "",
        referencia: "",
        notas: "",
      })
      loadRecibos()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el recibo",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
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
                <h1 className="text-3xl font-bold tracking-tight">Recibos de Ingresos</h1>
                <p className="text-muted-foreground">Gestiona los recibos de ingresos de efectivo</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Recibo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Recibo de Ingreso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Beneficiario *</Label>
                        <Input
                          placeholder="Nombre del cliente"
                          value={nuevoRecibo.beneficiario}
                          onChange={(e) => setNuevoRecibo({ ...nuevoRecibo, beneficiario: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Monto (RD$) *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={nuevoRecibo.monto}
                          onChange={(e) => setNuevoRecibo({ ...nuevoRecibo, monto: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Concepto *</Label>
                      <Input
                        placeholder="Descripción del ingreso"
                        value={nuevoRecibo.concepto}
                        onChange={(e) => setNuevoRecibo({ ...nuevoRecibo, concepto: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Método de Pago *</Label>
                        <Select
                          value={nuevoRecibo.metodo_pago}
                          onValueChange={(value) => setNuevoRecibo({ ...nuevoRecibo, metodo_pago: value })}
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
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCrearRecibo} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Recibo
                      </Button>
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
                    <Input placeholder="RI-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Input placeholder="Buscar cliente" />
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
                    <CardDescription>Lista de todos los recibos de ingresos</CardDescription>
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
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
                      {recibos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground">
                            No se encontraron recibos
                          </TableCell>
                        </TableRow>
                      ) : (
                        recibos.map((recibo) => (
                          <TableRow key={recibo.id}>
                            <TableCell className="font-medium">{recibo.numero}</TableCell>
                            <TableCell>{recibo.fecha}</TableCell>
                            <TableCell>{recibo.beneficiario}</TableCell>
                            <TableCell>{recibo.concepto}</TableCell>
                            <TableCell>{recibo.metodo_pago}</TableCell>
                            <TableCell className="text-right">RD$ {recibo.monto.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="default">{recibo.estado || "Emitido"}</Badge>
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
