"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function ConfiguracionPage() {
  const [empresaData, setEmpresaData] = useState({
    nombre: "Mi Empresa S.R.L.",
    rnc: "123-45678-9",
    telefono: "(809) 555-1234",
    email: "info@miempresa.com",
    sitioWeb: "www.miempresa.com",
  })

  const [notificaciones, setNotificaciones] = useState({
    email: true,
    facturas: true,
    inventario: false,
    reportes: true,
  })

  const handleEmpresaChange = (field: string, value: string) => {
    setEmpresaData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificacionChange = (field: string, value: boolean) => {
    setNotificaciones((prev) => ({ ...prev, [field]: value }))
  }

  const handleGuardarEmpresa = () => {
    console.log("[v0] Guardando información de empresa:", empresaData)
    alert("Información de empresa guardada exitosamente")
  }

  const handleGuardarNotificaciones = () => {
    console.log("[v0] Guardando configuración de notificaciones:", notificaciones)
    alert("Configuración de notificaciones guardada exitosamente")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
              <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Información básica de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">AD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Cambiar foto
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG. Máx 2MB</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input id="nombre" defaultValue="Administrador" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" defaultValue="admin@contabi.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" defaultValue="(809) 555-1234" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Input id="rol" defaultValue="Administrador" disabled />
                  </div>
                </div>

                <Button>Guardar cambios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de la empresa</CardTitle>
                <CardDescription>Datos de tu negocio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Nombre de la empresa</Label>
                    <Input
                      id="empresa"
                      value={empresaData.nombre}
                      onChange={(e) => handleEmpresaChange("nombre", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rnc">RNC</Label>
                    <Input
                      id="rnc"
                      value={empresaData.rnc}
                      onChange={(e) => handleEmpresaChange("rnc", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={empresaData.telefono}
                      onChange={(e) => handleEmpresaChange("telefono", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={empresaData.email}
                      onChange={(e) => handleEmpresaChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sitioWeb">Sitio Web</Label>
                    <Input
                      id="sitioWeb"
                      value={empresaData.sitioWeb}
                      onChange={(e) => handleEmpresaChange("sitioWeb", e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleGuardarEmpresa}>Guardar Cambios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferencias</CardTitle>
                <CardDescription>Personaliza tu experiencia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger id="idioma">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select defaultValue="dop">
                    <SelectTrigger id="moneda">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dop">DOP (RD$)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zona">Zona horaria</Label>
                  <Select defaultValue="ast">
                    <SelectTrigger id="zona">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ast">AST (GMT-4)</SelectItem>
                      <SelectItem value="est">EST (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Guardar cambios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Elige qué notificaciones recibir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por email</Label>
                    <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo</p>
                  </div>
                  <Switch
                    checked={notificaciones.email}
                    onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, email: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de facturas</Label>
                    <p className="text-sm text-muted-foreground">Notificaciones de nuevas facturas</p>
                  </div>
                  <Switch
                    checked={notificaciones.facturas}
                    onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, facturas: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de inventario</Label>
                    <p className="text-sm text-muted-foreground">Stock bajo o agotado</p>
                  </div>
                  <Switch
                    checked={notificaciones.inventario}
                    onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, inventario: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reportes semanales</Label>
                    <p className="text-sm text-muted-foreground">Resumen de actividad semanal</p>
                  </div>
                  <Switch
                    checked={notificaciones.reportes}
                    onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, reportes: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>Protege tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-actual">Contraseña actual</Label>
                  <Input id="password-actual" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-nueva">Nueva contraseña</Label>
                  <Input id="password-nueva" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-confirmar">Confirmar contraseña</Label>
                  <Input id="password-confirmar" type="password" />
                </div>
                <Button>Cambiar contraseña</Button>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de dos factores</Label>
                    <p className="text-sm text-muted-foreground">Seguridad adicional para tu cuenta</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
