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
import { Plus, Edit, Trash2, ChevronRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as contabilidadService from "@/lib/services/contabilidad.service"
import { useToast } from "@/hooks/use-toast"

export default function CatalogoCuentasPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState("todos")
  const [cuentas, setCuentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"


  const [formData, setFormData] = useState<{
  codigo: string
  nombre: string
  tipo: string
  nivel: string
  cuenta_padre_id?: string
  naturaleza?: "deudora" | "acreedora"
}>({
  codigo: "",
  nombre: "",
  tipo: "",
  nivel: "",
  cuenta_padre_id: undefined, // mejor undefined que ""
  naturaleza: "deudora", // valor por defecto
})

  useEffect(() => {
    loadCuentas()
  }, [])

  const loadCuentas = async () => {
    try {
      setLoading(true)
      const data = await contabilidadService.getAllCuentas()
      setCuentas(data)
    } catch (error) {
      console.error("[v0] Error loading cuentas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las cuentas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.codigo || !formData.nombre || !formData.tipo || !formData.nivel) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      await contabilidadService.createCuenta(empresaId, {
  codigo: formData.codigo,
  nombre: formData.nombre,
  tipo: formData.tipo,
  nivel: Number.parseInt(formData.nivel),
  cuenta_padre_id: formData.cuenta_padre_id || undefined,
  naturaleza: formData.naturaleza || "deudora", // asegurar valor
  balance: 0, // siempre iniciar en 0
  activo: true, // cuenta activa por defecto
})

      toast({
        title: "Éxito",
        description: "Cuenta creada correctamente",
      })

      setDialogAbierto(false)
      setFormData({
        codigo: "",
        nombre: "",
        tipo: "",
        nivel: "",
        cuenta_padre_id: "",
      })
      loadCuentas()
    } catch (error) {
      console.error("[v0] Error creating cuenta:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta cuenta?")) return

    try {
      await contabilidadService.deleteCuenta(empresaId,id)
      toast({
        title: "Éxito",
        description: "Cuenta eliminada correctamente",
      })
      loadCuentas()
    } catch (error) {
      console.error("[v0] Error deleting cuenta:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta",
        variant: "destructive",
      })
    }
  }

  const cuentasFiltradas = cuentas.filter((cuenta) => {
    return tipoFiltro === "todos" || cuenta.tipo === tipoFiltro
  })

  const getTipoBadge = (tipo: string) => {
    const colores = {
      activo: "bg-primary text-primary-foreground",
      pasivo: "bg-destructive text-destructive-foreground",
      capital: "bg-secondary text-secondary-foreground",
      ingreso: "bg-success text-success-foreground",
      gasto: "bg-warning text-warning-foreground",
    }
    return <Badge className={colores[tipo as keyof typeof colores]}>{tipo.toUpperCase()}</Badge>
  }

  const calcularTotalPorTipo = (tipo: string) => {
    return cuentas.filter((c) => c.tipo === tipo && c.nivel === 1).reduce((sum, c) => sum + (c.balance || 0), 0)
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Catálogo de Cuentas</h1>
              <p className="text-muted-foreground">Plan de cuentas contables</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Cuenta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Cuenta Contable</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código *</Label>
                      <Input
                        id="codigo"
                        placeholder="1.1.1.01"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="pasivo">Pasivo</SelectItem>
                          <SelectItem value="capital">Capital</SelectItem>
                          <SelectItem value="ingreso">Ingreso</SelectItem>
                          <SelectItem value="gasto">Gasto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la Cuenta *</Label>
                    <Input
                      id="nombre"
                      placeholder="Nombre de la cuenta"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nivel">Nivel *</Label>
                      <Select
                        value={formData.nivel}
                        onValueChange={(value) => setFormData({ ...formData, nivel: value })}
                      >
                        <SelectTrigger id="nivel">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Nivel 1 - Mayor</SelectItem>
                          <SelectItem value="2">Nivel 2 - Submáyor</SelectItem>
                          <SelectItem value="3">Nivel 3 - Auxiliar</SelectItem>
                          <SelectItem value="4">Nivel 4 - Detalle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="padre">Cuenta Padre</Label>
                      <Select
                        value={formData.cuenta_padre_id}
                        onValueChange={(value) => setFormData({ ...formData, cuenta_padre_id: value })}
                      >
                        <SelectTrigger id="padre">
                          <SelectValue placeholder="Ninguna" />
                        </SelectTrigger>
                        <SelectContent>
                          {cuentas
                            .filter((c) => c.nivel < 4)
                            .map((cuenta) => (
                              <SelectItem key={cuenta.id} value={cuenta.id}>
                                {cuenta.codigo} - {cuenta.nombre}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit}>Guardar Cuenta</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="w-full space-y-2 md:w-48">
                  <Label htmlFor="tipo">Tipo de Cuenta</Label>
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="pasivo">Pasivo</SelectItem>
                      <SelectItem value="capital">Capital</SelectItem>
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="gasto">Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-5 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">RD$ {calcularTotalPorTipo("activo").toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pasivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">RD$ {calcularTotalPorTipo("pasivo").toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Capital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">RD$ {calcularTotalPorTipo("capital").toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">RD$ {calcularTotalPorTipo("ingreso").toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">RD$ {calcularTotalPorTipo("gasto").toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Plan de Cuentas</CardTitle>
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
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cuentasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No se encontraron cuentas
                        </TableCell>
                      </TableRow>
                    ) : (
                      cuentasFiltradas.map((cuenta) => (
                        <TableRow key={cuenta.id}>
                          <TableCell className="font-mono text-sm font-medium">{cuenta.codigo}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {cuenta.nivel > 1 && (
                                <span style={{ marginLeft: `${(cuenta.nivel - 1) * 16}px` }}>
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </span>
                              )}
                              <span className={cuenta.nivel === 1 ? "font-bold" : ""}>{cuenta.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getTipoBadge(cuenta.tipo)}</TableCell>
                          <TableCell>Nivel {cuenta.nivel}</TableCell>
                          <TableCell className="text-right font-medium">
                            RD$ {(cuenta.balance || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cuenta.estado === "activa" ? "default" : "secondary"}>
                              {cuenta.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(cuenta.id)}>
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
