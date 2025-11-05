"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import * as suplidoresService from "@/lib/services/suplidores.service"
import { useToast } from "@/hooks/use-toast"
import { checkSubscriptionLimit } from "@/lib/subscription"
import { Loader2 } from "lucide-react"

export default function SuplidoresPage() {
  const [suplidores, setSuplidores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    rnc: "",
    telefono: "",
    email: "",
    direccion: "",
    persona_contacto: "",
    terminos_pago: "",
  })

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      setLoading(true)
      const data = await suplidoresService.getAllSuplidores()
      setSuplidores(data)
    } catch (error) {
      console.error("[v0] Error loading suplidores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los suplidores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const canAdd = await checkSubscriptionLimit("vendors", suplidores.length)
    if (!canAdd) {
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite de suplidores para tu plan.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await suplidoresService.createSuplidor(empresaId, {
  codigo: formData.codigo,
  nombre: formData.nombre,
  rnc: formData.rnc,
  telefono: formData.telefono,
  email: formData.email,
  direccion: formData.direccion,
  persona_contacto: formData.persona_contacto,
  terminos_pago: Number.parseInt(formData.terminos_pago) || 30,
  activo: true,
  balance: 0, // ✅ inicializamos balance
      })

      toast({
        title: "Suplidor creado",
        description: "El suplidor se ha guardado correctamente",
      })

      setDialogAbierto(false)
      setFormData({
        codigo: "",
        nombre: "",
        rnc: "",
        telefono: "",
        email: "",
        direccion: "",
        persona_contacto: "",
        terminos_pago: "",
      })
      loadVendors()
    } catch (error) {
      console.error("[v0] Error creating suplidor:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el suplidor",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este suplidor?")) return

    try {
      await suplidoresService.deleteSuplidor(id,empresaId)
      toast({
        title: "Suplidor eliminado",
        description: "El suplidor se ha eliminado correctamente",
      })
      loadVendors()
    } catch (error) {
      console.error("[v0] Error deleting suplidor:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el suplidor",
        variant: "destructive",
      })
    }
  }

  const suplidoresFiltrados = suplidores.filter(
    (suplidor) =>
      suplidor.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      suplidor.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      suplidor.rnc?.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-navy text-3xl font-bold text-balance">Suplidores</h1>
              <p className="text-muted-foreground">Gestión de suplidores y proveedores</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Suplidor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Suplidor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigo">Código *</Label>
                        <Input
                          id="codigo"
                          placeholder="SUP-001"
                          value={formData.codigo}
                          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rnc">RNC *</Label>
                        <Input
                          id="rnc"
                          placeholder="000-0000000-0"
                          value={formData.rnc}
                          onChange={(e) => setFormData({ ...formData, rnc: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre/Razón Social *</Label>
                      <Input
                        id="nombre"
                        placeholder="Nombre del suplidor"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          placeholder="809-000-0000"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="suplidor@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        placeholder="Dirección completa"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contacto">Persona de Contacto</Label>
                        <Input
                          id="contacto"
                          placeholder="Nombre del contacto"
                          value={formData.persona_contacto}
                          onChange={(e) => setFormData({ ...formData, persona_contacto: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dias-pago">Días de Pago</Label>
                        <Input
                          id="dias-pago"
                          type="number"
                          placeholder="30"
                          value={formData.terminos_pago}
                          onChange={(e) => setFormData({ ...formData, terminos_pago: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogAbierto(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Suplidor
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="busqueda">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="busqueda"
                      placeholder="Buscar por nombre, código o RNC..."
                      className="pl-10"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Suplidores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{suplidores.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Suplidores activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Con Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{suplidores.filter((s) => s.email).length}</div>
                <p className="text-xs text-muted-foreground mt-1">Suplidores con email</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Con Teléfono</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{suplidores.filter((s) => s.telefono).length}</div>
                <p className="text-xs text-muted-foreground mt-1">Suplidores con teléfono</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Suplidores</CardTitle>
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
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>RNC</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suplidoresFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No se encontraron suplidores
                        </TableCell>
                      </TableRow>
                    ) : (
                      suplidoresFiltrados.map((suplidor) => (
                        <TableRow key={suplidor.id}>
                          <TableCell className="font-mono text-sm">{suplidor.codigo}</TableCell>
                          <TableCell className="font-medium">{suplidor.nombre}</TableCell>
                          <TableCell className="font-mono text-sm">{suplidor.rnc}</TableCell>
                          <TableCell>{suplidor.telefono || "-"}</TableCell>
                          <TableCell>{suplidor.email || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={suplidor.estado === "activo" ? "default" : "secondary"}>
                              {suplidor.estado === "activo" ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(suplidor.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
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
        </main>
      </div>
    </div>
  )
}
