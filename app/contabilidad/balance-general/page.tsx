"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as reportesContablesService from "@/lib/services/reportes-contables.service"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"

const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export default function BalanceGeneralPage() {
  const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [activos, setActivos] = useState<any[]>([])
  const [pasivos, setPasivos] = useState<any[]>([])
  const [capital, setCapital] = useState<any[]>([])

  useEffect(() => {
    loadBalanceGeneral()
  }, [])

  const loadBalanceGeneral = async () => {
    try {
      setLoading(true)
      const balance = await reportesContablesService.getBalanceGeneral(PLACEHOLDER_EMPRESA_ID, fechaCorte)
      setActivos(balance.activos.corrientes.concat(balance.activos.no_corrientes))
      setPasivos(balance.pasivos.corrientes.concat(balance.pasivos.no_corrientes))
      setCapital(balance.capital.cuentas)
    } catch (error) {
      console.error("Error loading balance general:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalActivos = activos.reduce((sum, c) => sum + (c.balance || 0), 0)
  const totalPasivos = pasivos.reduce((sum, c) => sum + (c.balance || 0), 0)
  const totalCapital = capital.reduce((sum, c) => sum + (c.balance || 0), 0)
  const totalPasivoCapital = totalPasivos + totalCapital

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando balance general...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Balance General</h1>
              <p className="text-muted-foreground">Estado de situación financiera</p>
            </div>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="w-full space-y-2 md:w-64">
                  <Label htmlFor="fecha-corte">Fecha de Corte</Label>
                  <Input
                    id="fecha-corte"
                    type="date"
                    value={fechaCorte}
                    onChange={(e) => setFechaCorte(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={loadBalanceGeneral}>
                  Generar Balance
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle>ACTIVOS</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {activos
                    .filter((c) => c.nivel <= 2)
                    .map((cuenta) => (
                      <div key={cuenta.id} className="flex justify-between border-b pb-2">
                        <div>
                          <p className={`${cuenta.nivel === 1 ? "font-bold" : "ml-4"}`}>{cuenta.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono">{cuenta.codigo}</p>
                        </div>
                        <p className={`font-medium ${cuenta.nivel === 1 ? "font-bold" : ""}`}>
                          RD$ {(cuenta.balance || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  <div className="flex justify-between border-t-2 pt-4">
                    <p className="text-lg font-bold">TOTAL ACTIVOS</p>
                    <p className="text-lg font-bold text-primary">RD$ {totalActivos.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-destructive text-destructive-foreground">
                  <CardTitle>PASIVOS</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {pasivos
                      .filter((c) => c.nivel <= 2)
                      .map((cuenta) => (
                        <div key={cuenta.id} className="flex justify-between border-b pb-2">
                          <div>
                            <p className={`${cuenta.nivel === 1 ? "font-bold" : "ml-4"}`}>{cuenta.nombre}</p>
                            <p className="text-xs text-muted-foreground font-mono">{cuenta.codigo}</p>
                          </div>
                          <p className={`font-medium ${cuenta.nivel === 1 ? "font-bold" : ""}`}>
                            RD$ {(cuenta.balance || 0).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    <div className="flex justify-between border-t pt-2">
                      <p className="font-semibold">TOTAL PASIVOS</p>
                      <p className="font-semibold">RD$ {totalPasivos.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-secondary text-secondary-foreground">
                  <CardTitle>CAPITAL</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {capital
                      .filter((c) => c.nivel <= 2)
                      .map((cuenta) => (
                        <div key={cuenta.id} className="flex justify-between border-b pb-2">
                          <div>
                            <p className={`${cuenta.nivel === 1 ? "font-bold" : "ml-4"}`}>{cuenta.nombre}</p>
                            <p className="text-xs text-muted-foreground font-mono">{cuenta.codigo}</p>
                          </div>
                          <p className={`font-medium ${cuenta.nivel === 1 ? "font-bold" : ""}`}>
                            RD$ {(cuenta.balance || 0).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    <div className="flex justify-between border-t pt-2">
                      <p className="font-semibold">TOTAL CAPITAL</p>
                      <p className="font-semibold">RD$ {totalCapital.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <p className="text-lg font-bold">TOTAL PASIVO + CAPITAL</p>
                    <p className="text-lg font-bold text-primary">RD$ {totalPasivoCapital.toLocaleString()}</p>
                  </div>
                  <div className="mt-4 rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">
                      Balance:{" "}
                      <span className={totalActivos === totalPasivoCapital ? "text-success" : "text-destructive"}>
                        {totalActivos === totalPasivoCapital ? "Cuadrado ✓" : "Descuadrado"}
                      </span>
                    </p>
                    {totalActivos !== totalPasivoCapital && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Diferencia: RD$ {Math.abs(totalActivos - totalPasivoCapital).toLocaleString()}
                      </p>
                    )}
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
