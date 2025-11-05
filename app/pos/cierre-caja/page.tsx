"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, CreditCard, Banknote, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import * as cierresCajaService from "@/lib/services/cierres-caja.service"
import * as facturasService from "@/lib/services/facturas.service"

export default function CierreCajaPage() {
  const [efectivoContado, setEfectivoContado] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [ventasDelDia, setVentasDelDia] = useState({
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    cheque: 0,
    credito: 0,
  })
  const [facturasCierre, setFacturasCierre] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCierreData()
  }, [])

  const loadCierreData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split("T")[0]

      const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"
      const facturas = await facturasService.getFacturasByDateRange(PLACEHOLDER_EMPRESA_ID, today, today)
      setFacturasCierre(facturas)

      const totales = facturas.reduce((acc: any, factura: any) => {
        const metodo = factura.metodo_pago || "efectivo"
        acc[metodo] = (acc[metodo] || 0) + (factura.total || 0)
        return acc
      }, {})

      setVentasDelDia({
        efectivo: totales.efectivo || 0,
        tarjeta: totales.tarjeta || 0,
        transferencia: totales.transferencia || 0,
        cheque: totales.cheque || 0,
        credito: totales.credito || 0,
      })
    } catch (error) {
      console.error("[v0] Error loading cierre data:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalVentas = Object.values(ventasDelDia).reduce((sum, val) => sum + val, 0)
  const efectivoEsperado = ventasDelDia.efectivo
  const diferencia = efectivoContado ? Number(efectivoContado) - efectivoEsperado : 0

  const realizarCierre = async () => {
    if (!efectivoContado) {
      alert("Por favor ingrese el efectivo contado")
      return
    }

    try {
      const cierreData = {
        efectivo_sistema: efectivoEsperado,
        efectivo_contado: Number(efectivoContado),
        diferencia,
        total_ventas: totalVentas,
        total_efectivo: ventasDelDia.efectivo,
        total_tarjeta: ventasDelDia.tarjeta,
        total_transferencia: ventasDelDia.transferencia,
        total_cheque: ventasDelDia.cheque,
        total_credito: ventasDelDia.credito,
        observaciones,
      }

      await cierresCajaService.createCierreCaja(cierreData)
      alert("Cierre de caja realizado exitosamente")

      setEfectivoContado("")
      setObservaciones("")
      loadCierreData()
    } catch (error) {
      console.error("[v0] Error saving cierre:", error)
      alert("Error al realizar el cierre de caja")
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-balance">Cierre de Caja</h1>
            <p className="text-muted-foreground">
              Cierre diario de operaciones - {new Date().toLocaleDateString("es-DO")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">RD$ {ventasDelDia.efectivo.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Ventas en efectivo</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Tarjeta</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">RD$ {ventasDelDia.tarjeta.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tarjeta crédito/débito</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Transferencia</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">RD$ {ventasDelDia.transferencia.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Transferencias bancarias</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Facturas del Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Cargando facturas...
                          </TableCell>
                        </TableRow>
                      ) : facturasCierre.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No hay facturas para hoy
                          </TableCell>
                        </TableRow>
                      ) : (
                        facturasCierre.map((factura) => (
                          <TableRow key={factura.id}>
                            <TableCell className="font-medium">{factura.numero_factura}</TableCell>
                            <TableCell>{factura.clientes?.nombre || "N/A"}</TableCell>
                            <TableCell className="capitalize">{factura.metodo_pago || "N/A"}</TableCell>
                            <TableCell className="text-right">RD$ {factura.total?.toLocaleString() || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Ventas por Método</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(ventasDelDia).map(([metodo, monto]) => (
                      <div key={metodo} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <span className="font-medium capitalize">{metodo}</span>
                        <span className="text-lg font-semibold">RD$ {monto.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-lg font-bold">Total del Día</span>
                      <span className="text-2xl font-bold text-primary">RD$ {totalVentas.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conteo de Efectivo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="efectivo-esperado">Efectivo Esperado</Label>
                    <Input
                      id="efectivo-esperado"
                      value={`RD$ ${efectivoEsperado.toLocaleString()}`}
                      disabled
                      className="font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="efectivo-contado">Efectivo Contado</Label>
                    <Input
                      id="efectivo-contado"
                      type="number"
                      placeholder="0.00"
                      value={efectivoContado}
                      onChange={(e) => setEfectivoContado(e.target.value)}
                    />
                  </div>

                  {efectivoContado && (
                    <div
                      className={`rounded-lg p-4 ${
                        diferencia === 0
                          ? "bg-success/10 text-success"
                          : diferencia > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <div className="text-sm font-medium">Diferencia</div>
                      <div className="text-2xl font-bold">
                        {diferencia > 0 ? "+" : ""}RD$ {Math.abs(diferencia).toLocaleString()}
                      </div>
                      <div className="text-xs mt-1">
                        {diferencia === 0 ? "Cuadre perfecto" : diferencia > 0 ? "Sobrante" : "Faltante"}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Observaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="observaciones">Notas del Cierre</Label>
                    <textarea
                      id="observaciones"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Ingrese cualquier observación sobre el cierre..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" size="lg" onClick={realizarCierre}>
                    <Lock className="mr-2 h-4 w-4" />
                    Realizar Cierre de Caja
                  </Button>

                  <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Nota:</p>
                    <p>El cierre de caja es irreversible. Asegúrese de verificar todos los montos antes de proceder.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
