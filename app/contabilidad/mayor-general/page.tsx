"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as contabilidadService from "@/lib/services/contabilidad.service"
import { getMayorGeneral } from "@/lib/services/contabilidad.service"

export default function MayorGeneralPage() {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("")
  const [fechaInicio, setFechaInicio] = useState("2025-01-01")
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split("T")[0])
  const [cuentas, setCuentas] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMovimientos, setLoadingMovimientos] = useState(false)
  

  useEffect(() => {
    loadCuentas()
  }, [])

  useEffect(() => {
    if (cuentaSeleccionada) {
      loadMovimientos()
    }
  }, [cuentaSeleccionada, fechaInicio, fechaFin])

  const loadCuentas = async () => {
    try {
      setLoading(true)
      const data = await contabilidadService.getAllCuentas()
      setCuentas(data.filter((c) => c.nivel === 4)) // Solo cuentas de detalle
    } catch (error) {
      console.error("[v0] Error loading cuentas:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMovimientos = async () => {
    try {
      setLoadingMovimientos(true)
      const data = await contabilidadService.getMayorGeneral(cuentaSeleccionada, fechaInicio, fechaFin)
      setMovimientos(data)
    } catch (error) {
      console.error("[v0] Error loading movimientos:", error)
    } finally {
      setLoadingMovimientos(false)
    }
  }

  const cuenta = cuentas.find((c) => c.id === cuentaSeleccionada)

  const calcularTotales = () => {
    const totalDebito = movimientos.reduce((sum, m) => sum + (m.debito || 0), 0)
    const totalCredito = movimientos.reduce((sum, m) => sum + (m.credito || 0), 0)
    return { totalDebito, totalCredito }
  }

  const { totalDebito, totalCredito } = calcularTotales()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Mayor General</h1>
              <p className="text-muted-foreground">Movimientos detallados por cuenta</p>
            </div>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cuenta">Cuenta Contable</Label>
                  <Select value={cuentaSeleccionada} onValueChange={setCuentaSeleccionada}>
                    <SelectTrigger id="cuenta">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-fin">Fecha Fin</Label>
                  <Input id="fecha-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {cuentaSeleccionada && cuenta && (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Información de la Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Código</p>
                      <p className="text-lg font-mono font-semibold">{cuenta.codigo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="text-lg font-semibold">{cuenta.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="text-lg font-semibold capitalize">{cuenta.tipo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance Actual</p>
                      <p className="text-lg font-bold text-primary">RD$ {(cuenta.balance || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Movimientos del Mayor</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingMovimientos ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Asiento</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Débito</TableHead>
                          <TableHead className="text-right">Crédito</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movimientos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              No hay movimientos en el período seleccionado
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            {movimientos.map((mov, index) => (
                              <TableRow key={index}>
                                <TableCell>{new Date(mov.fecha).toLocaleDateString("es-DO")}</TableCell>
                                <TableCell className="font-mono text-sm">{mov.numero_asiento}</TableCell>
                                <TableCell>{mov.descripcion}</TableCell>
                                <TableCell className="text-right">
                                  {mov.debito > 0 ? `RD$ ${mov.debito.toLocaleString()}` : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {mov.credito > 0 ? `RD$ ${mov.credito.toLocaleString()}` : "-"}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  RD$ {(mov.balance || 0).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell colSpan={3}>TOTALES</TableCell>
                              <TableCell className="text-right">RD$ {totalDebito.toLocaleString()}</TableCell>
                              <TableCell className="text-right">RD$ {totalCredito.toLocaleString()}</TableCell>
                              <TableCell className="text-right">RD$ {(cuenta.balance || 0).toLocaleString()}</TableCell>
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {!cuentaSeleccionada && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-lg font-medium text-muted-foreground">Seleccione una cuenta para ver su mayor</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Elija una cuenta del catálogo para visualizar sus movimientos
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
