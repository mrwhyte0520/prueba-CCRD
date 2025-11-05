"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Building2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as almacenesService from "@/lib/services/almacenes.service"

export default function AlmacenesPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    direccion: "",
    responsable: "",
  })

  useEffect(() => {
    loadAlmacenes()
  }, [])

  const loadAlmacenes = async () => {
    try {
      setLoading(true)
      const data = await almacenesService.getAllAlmacenes()
      setAlmacenes(data)
    } catch (error) {
      console.error("[v0] Error loading almacenes:", error)
    } finally {
      setLoading(false)
    }
  }

  const guardarAlmacen = async () => {
    if (!formData.nombre || !formData.codigo) {
      alert("Por favor complete los campos requeridos")
      return
    }

    try {
      await almacenesService.createAlmacen({
        codigo: formData.codigo,
        nombre: formData.nombre,
        direccion: formData.direccion,
        responsable: formData.responsable,
        estado: "activo",
      })

      alert("Almacén guardado exitosamente")
      setDialogAbierto(false)
      setFormData({ codigo: "", nombre: "", direccion: "", responsable: "" })
      loadAlmacenes()
    } catch (error) {
      console.error("[v0] Error saving almacen:", error)
      alert("Error al guardar el almacén")
    }
  }

  const eliminarAlmacen = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este almacén?")) return

    try {
      await almacenesService.deleteAlmacen(id)
      alert("Almacén eliminado exitosamente")
      loadAlmacenes()
    } catch (error) {
      console.error("[v0] Error deleting almacen:", error)
      alert("Error al eliminar el almacén")
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Almacenes</h1>
              <p className="text-muted-foreground">Gestión de almacenes y ubicaciones</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Almacén
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Almacén</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      placeholder="ALM-001"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      placeholder="Nombre del almacén"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
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
                  <div className="space-y-2">
                    <Label htmlFor="responsable">Responsable</Label>
                    <Input
                      id="responsable"
                      placeholder="Nombre del responsable"
                      value={formData.responsable}
                      onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarAlmacen}>Guardar Almacén</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando almacenes...</div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {almacenes.map((almacen) => (
                  <Card key={almacen.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-medium">{almacen.nombre}</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Código:</span>
                          <span className="font-mono">{almacen.codigo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Responsable:</span>
                          <span className="font-medium">{almacen.responsable || "N/A"}</span>
                        </div>
                        <div className="pt-2">
                          <p className="text-muted-foreground text-xs">{almacen.direccion || "N/A"}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant={almacen.estado === "activo" ? "default" : "secondary"}>
                            {almacen.estado}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => eliminarAlmacen(almacen.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Almacenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Dirección</TableHead>
                        <TableHead>Responsable</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {almacenes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No hay almacenes registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        almacenes.map((almacen) => (
                          <TableRow key={almacen.id}>
                            <TableCell className="font-mono text-sm">{almacen.codigo}</TableCell>
                            <TableCell className="font-medium">{almacen.nombre}</TableCell>
                            <TableCell className="text-muted-foreground">{almacen.direccion || "N/A"}</TableCell>
                            <TableCell>{almacen.responsable || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant={almacen.estado === "activo" ? "default" : "secondary"}>
                                {almacen.estado}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => eliminarAlmacen(almacen.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
