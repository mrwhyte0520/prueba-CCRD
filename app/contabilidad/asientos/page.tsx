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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Eye, Trash2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as contabilidadService from "@/lib/services/contabilidad.service"
import { useToast } from "@/hooks/use-toast"
import { createAsientoContable } from "@/lib/services/asientos-contables.service"

export default function AsientosContablesPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [asientos, setAsientos] = useState<any[]>([])
  const [cuentas, setCuentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [detalles, setDetalles] = useState<Array<{ cuenta_id: string; debito: number; credito: number }>>([])
  const { toast } = useToast()
 const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
    referencia: "",
    tipo: "diario",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [asientosData, cuentasData] = await Promise.all([
        contabilidadService.getAllAsientos(),
        contabilidadService.getAllCuentas(),
      ])
      setAsientos(asientosData)
      setCuentas(cuentasData.filter((c) => c.nivel === 4)) // Solo cuentas de detalle
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const agregarDetalle = () => {
    setDetalles([...detalles, { cuenta_id: "", debito: 0, credito: 0 }])
  }

  const actualizarDetalle = (index: number, campo: string, valor: any) => {
    const nuevosDetalles = [...detalles]
    nuevosDetalles[index] = { ...nuevosDetalles[index], [campo]: valor }
    setDetalles(nuevosDetalles)
  }

  const eliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const calcularTotales = () => {
    const totalDebito = detalles.reduce((sum, d) => sum + (d.debito || 0), 0)
    const totalCredito = detalles.reduce((sum, d) => sum + (d.credito || 0), 0)
    return { totalDebito, totalCredito, diferencia: totalDebito - totalCredito }
  }

  const guardarAsiento = async (publicar = false) => {
    const { totalDebito, totalCredito, diferencia } = calcularTotales()

    if (diferencia !== 0) {
      toast({
        title: "Error",
        description: "El asiento debe estar cuadrado (débitos = créditos)",
        variant: "destructive",
      })
      return
    }

    if (detalles.length < 2) {
      toast({
        title: "Error",
        description: "El asiento debe tener al menos 2 líneas",
        variant: "destructive",
      })
      return
    }

    try {
      
    await createAsientoContable(empresaId, {
  numero: "", 
  fecha: formData.fecha,
  tipo: formData.tipo as "diario" | "ajuste" | "cierre" | "apertura",
  descripcion: formData.descripcion,
  referencia: formData.referencia,
  detalles: detalles.map(d => ({
    cuenta_id: d.cuenta_id,
    debe: d.debito || 0,
    haber: d.credito || 0,
    descripcion: "", // obligatorio
  })),
})

      toast({
        title: "Éxito",
        description: `Asiento ${publicar ? "publicado" : "guardado"} correctamente`,
      })

      setDialogAbierto(false)
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        descripcion: "",
        referencia: "",
        tipo: "diario",
      })
      setDetalles([])
      loadData()
    } catch (error) {
      console.error("[v0] Error saving asiento:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el asiento",
        variant: "destructive",
      })
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "borrador":
        return <Badge className="bg-warning text-warning-foreground">Borrador</Badge>
      case "publicado":
        return <Badge className="bg-success text-success-foreground">Publicado</Badge>
      case "anulado":
        return <Badge variant="destructive">Anulado</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const { totalDebito, totalCredito, diferencia } = calcularTotales()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Asientos Contables</h1>
              <p className="text-muted-foreground">Registro de transacciones contables</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Asiento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Asiento Contable</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referencia">Referencia</Label>
                      <Input
                        id="referencia"
                        placeholder="Número de referencia"
                        value={formData.referencia}
                        onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diario">Diario</SelectItem>
                          <SelectItem value="ajuste">Ajuste</SelectItem>
                          <SelectItem value="cierre">Cierre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                      id="descripcion"
                      placeholder="Descripción del asiento"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Detalle del Asiento</Label>
                      <Button type="button" variant="outline" size="sm" onClick={agregarDetalle}>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Línea
                      </Button>
                    </div>
                    <div className="rounded-lg border max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cuenta</TableHead>
                            <TableHead className="text-right">Débito</TableHead>
                            <TableHead className="text-right">Crédito</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detalles.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                                No hay líneas agregadas. Haga clic en "Agregar Línea" para comenzar.
                              </TableCell>
                            </TableRow>
                          ) : (
                            detalles.map((detalle, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Select
                                    value={detalle.cuenta_id}
                                    onValueChange={(value) => actualizarDetalle(index, "cuenta_id", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar cuenta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cuentas.map((cuenta) => (
                                        <SelectItem key={cuenta.id} value={cuenta.id}>
                                          {cuenta.codigo} - {cuenta.nombre}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="text-right"
                                    value={detalle.debito || ""}
                                    onChange={(e) =>
                                      actualizarDetalle(index, "debito", Number.parseFloat(e.target.value) || 0)
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="text-right"
                                    value={detalle.credito || ""}
                                    onChange={(e) =>
                                      actualizarDetalle(index, "credito", Number.parseFloat(e.target.value) || 0)
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => eliminarDetalle(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                          {detalles.length > 0 && (
                            <TableRow className="bg-muted/50 font-semibold">
                              <TableCell>TOTALES</TableCell>
                              <TableCell className="text-right">RD$ {totalDebito.toLocaleString()}</TableCell>
                              <TableCell className="text-right">RD$ {totalCredito.toLocaleString()}</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {detalles.length > 0 && (
                      <div
                        className={`rounded-lg p-3 text-sm ${diferencia === 0 ? "bg-success/10" : "bg-destructive/10"}`}
                      >
                        <p className={`font-medium ${diferencia === 0 ? "text-success" : "text-destructive"}`}>
                          Diferencia: RD$ {Math.abs(diferencia).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {diferencia === 0
                            ? "El asiento está cuadrado"
                            : "El asiento debe estar cuadrado (débitos = créditos)"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button variant="outline" onClick={() => guardarAsiento(false)}>
                    Guardar como Borrador
                  </Button>
                  <Button onClick={() => guardarAsiento(true)} disabled={diferencia !== 0}>
                    Publicar Asiento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Asientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{asientos.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Publicados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {asientos.filter((a) => a.estado === "publicado").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Asientos confirmados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Borradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {asientos.filter((a) => a.estado === "borrador").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pendientes de publicar</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Asientos Contables</CardTitle>
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
                      <TableHead>Descripción</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asientos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No hay asientos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      asientos.map((asiento) => (
                        <TableRow key={asiento.id}>
                          <TableCell className="font-mono text-sm">{asiento.numero_asiento}</TableCell>
                          <TableCell>{new Date(asiento.fecha).toLocaleDateString("es-DO")}</TableCell>
                          <TableCell className="font-medium">{asiento.descripcion}</TableCell>
                          <TableCell className="font-mono text-sm">{asiento.referencia || "-"}</TableCell>
                          <TableCell className="text-right font-medium">
                            RD$ {(asiento.total || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>{getEstadoBadge(asiento.estado)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {asiento.estado === "borrador" && (
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
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
        </main>
      </div>
    </div>
  )
}
