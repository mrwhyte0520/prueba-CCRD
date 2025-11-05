"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Settings, FileText, AlertCircle } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import * as impuestosService from "@/lib/services/impuestos.service"

export default function ConfiguracionImpuestosPage() {
  const [config, setConfig] = useState({
    rnc: "123456789",
    razonSocial: "Mi Empresa SRL",
    nombreComercial: "Mi Empresa",
    direccion: "Calle Principal #123, Santo Domingo",
    telefono: "809-555-1234",
    email: "info@miempresa.com",
    actividadEconomica: "Comercio al por menor",
    tipoContribuyente: "Normal",
    periodoFiscal: "Mensual",
    itbisActivo: true,
    tasaITBIS: 18,
    isr: true,
    tasaISR: 27,
    retencionISR: true,
    retencionITBIS: true,
    ncfActivo: true,
    secuenciaNCF: "B0100000001",
    ecfActivo: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadConfiguracion()
  }, [])

  const loadConfiguracion = async () => {
    try {
      setIsLoading(true)
      const empresaId = "00000000-0000-0000-0000-000000000000" // TODO: Get from auth
      const data = await impuestosService.getConfiguracionImpuestos(empresaId)

      if (data && data.length > 0) {
        // Map database config to UI state
        const itbisConfig = data.find((c: any) => c.tipo_impuesto === "itbis")
        const isrConfig = data.find((c: any) => c.tipo_impuesto === "isr")

        if (itbisConfig) {
          setConfig((prev) => ({
            ...prev,
            itbisActivo: itbisConfig.activo,
            tasaITBIS: itbisConfig.tasa,
          }))
        }

        if (isrConfig) {
          setConfig((prev) => ({
            ...prev,
            isr: isrConfig.activo,
            tasaISR: isrConfig.tasa,
          }))
        }
      }
    } catch (error) {
      console.error("[v0] Error loading configuracion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfiguracion = async () => {
    try {
      setIsSaving(true)
      const empresaId = "00000000-0000-0000-0000-000000000000" // TODO: Get from auth

      // Save ITBIS configuration
      await impuestosService.upsertConfiguracionImpuesto(empresaId, {
        tipo_impuesto: "itbis",
        tasa: config.tasaITBIS,
        descripcion: "Impuesto sobre Transferencias de Bienes y Servicios",
        activo: config.itbisActivo,
      })

      // Save ISR configuration
      await impuestosService.upsertConfiguracionImpuesto(empresaId, {
        tipo_impuesto: "isr",
        tasa: config.tasaISR,
        descripcion: "Impuesto Sobre la Renta",
        activo: config.isr,
      })

      alert("Configuración guardada exitosamente")
    } catch (error) {
      console.error("[v0] Error saving configuracion:", error)
      alert("Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando configuración...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Configuración de Impuestos</h1>
              <p className="text-muted-foreground">Configure los parámetros fiscales y tributarios de su empresa</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Información Fiscal
                  </CardTitle>
                  <CardDescription>Datos de registro ante la DGII</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rnc">RNC</Label>
                    <Input
                      id="rnc"
                      value={config.rnc}
                      onChange={(e) => setConfig({ ...config, rnc: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razonSocial">Razón Social</Label>
                    <Input
                      id="razonSocial"
                      value={config.razonSocial}
                      onChange={(e) => setConfig({ ...config, razonSocial: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombreComercial">Nombre Comercial</Label>
                    <Input
                      id="nombreComercial"
                      value={config.nombreComercial}
                      onChange={(e) => setConfig({ ...config, nombreComercial: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={config.direccion}
                      onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={config.telefono}
                        onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={config.email}
                        onChange={(e) => setConfig({ ...config, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actividad">Actividad Económica</Label>
                    <Input
                      id="actividad"
                      value={config.actividadEconomica}
                      onChange={(e) => setConfig({ ...config, actividadEconomica: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipoContribuyente">Tipo de Contribuyente</Label>
                      <Select
                        value={config.tipoContribuyente}
                        onValueChange={(value) => setConfig({ ...config, tipoContribuyente: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="PST">Persona Física con Negocio (PST)</SelectItem>
                          <SelectItem value="Especial">Régimen Especial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="periodo">Período Fiscal</Label>
                      <Select
                        value={config.periodoFiscal}
                        onValueChange={(value) => setConfig({ ...config, periodoFiscal: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mensual">Mensual</SelectItem>
                          <SelectItem value="Bimestral">Bimestral</SelectItem>
                          <SelectItem value="Anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Configuración de Impuestos
                  </CardTitle>
                  <CardDescription>Tasas y parámetros tributarios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="itbis">ITBIS (IVA)</Label>
                        <p className="text-sm text-muted-foreground">Impuesto sobre Transferencias de Bienes</p>
                      </div>
                      <Switch
                        id="itbis"
                        checked={config.itbisActivo}
                        onCheckedChange={(checked) => setConfig({ ...config, itbisActivo: checked })}
                      />
                    </div>
                    {config.itbisActivo && (
                      <div className="space-y-2 pl-4">
                        <Label htmlFor="tasaITBIS">Tasa ITBIS (%)</Label>
                        <Input
                          id="tasaITBIS"
                          type="number"
                          value={config.tasaITBIS}
                          onChange={(e) => setConfig({ ...config, tasaITBIS: Number.parseFloat(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isr">ISR</Label>
                        <p className="text-sm text-muted-foreground">Impuesto Sobre la Renta</p>
                      </div>
                      <Switch
                        id="isr"
                        checked={config.isr}
                        onCheckedChange={(checked) => setConfig({ ...config, isr: checked })}
                      />
                    </div>
                    {config.isr && (
                      <div className="space-y-2 pl-4">
                        <Label htmlFor="tasaISR">Tasa ISR (%)</Label>
                        <Input
                          id="tasaISR"
                          type="number"
                          value={config.tasaISR}
                          onChange={(e) => setConfig({ ...config, tasaISR: Number.parseFloat(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="retencionISR">Retención ISR</Label>
                      <p className="text-sm text-muted-foreground">Aplicar retenciones de ISR</p>
                    </div>
                    <Switch
                      id="retencionISR"
                      checked={config.retencionISR}
                      onCheckedChange={(checked) => setConfig({ ...config, retencionISR: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="retencionITBIS">Retención ITBIS</Label>
                      <p className="text-sm text-muted-foreground">Aplicar retenciones de ITBIS</p>
                    </div>
                    <Switch
                      id="retencionITBIS"
                      checked={config.retencionITBIS}
                      onCheckedChange={(checked) => setConfig({ ...config, retencionITBIS: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Comprobantes Fiscales
                  </CardTitle>
                  <CardDescription>Configuración de NCF y E-CF</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ncf">NCF (Comprobantes Físicos)</Label>
                      <p className="text-sm text-muted-foreground">Números de Comprobante Fiscal</p>
                    </div>
                    <Switch
                      id="ncf"
                      checked={config.ncfActivo}
                      onCheckedChange={(checked) => setConfig({ ...config, ncfActivo: checked })}
                    />
                  </div>
                  {config.ncfActivo && (
                    <div className="space-y-2 pl-4">
                      <Label htmlFor="secuenciaNcf">Secuencia NCF Actual</Label>
                      <Input
                        id="secuenciaNcf"
                        value={config.secuenciaNCF}
                        onChange={(e) => setConfig({ ...config, secuenciaNCF: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Formato: B01XXXXXXXX (Serie + 8 dígitos)</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ecf">E-CF (Comprobantes Electrónicos)</Label>
                      <p className="text-sm text-muted-foreground">Facturación Electrónica DGII</p>
                    </div>
                    <Switch
                      id="ecf"
                      checked={config.ecfActivo}
                      onCheckedChange={(checked) => setConfig({ ...config, ecfActivo: checked })}
                    />
                  </div>
                  {config.ecfActivo && (
                    <div className="space-y-2 pl-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900">Configuración E-CF</p>
                      <p className="text-xs text-blue-700">
                        Para activar la facturación electrónica, debe registrarse en el portal de la DGII y obtener sus
                        credenciales de acceso.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button size="lg" onClick={handleSaveConfiguracion} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
