"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Eye, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as clientesService from "@/lib/services/clientes.service"
import { useToast } from "@/hooks/use-toast"

export default function ClientesPage() {
  const [busqueda, setBusqueda] = useState("")
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"
  const [formData, setFormData] = useState({
    nombre: "",
    rnc_cedula: "",
    email: "",
    telefono: "",
    direccion: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    try {
      setLoading(true)
      const data = await clientesService.getAllClientes()
      setClientes(data || [])
    } catch (error: any) {
      console.error("[v0] Error loading customers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveCustomer() {
    try {
      if (!formData.nombre) {
        toast({
          title: "Error",
          description: "El nombre es requerido",
          variant: "destructive",
        })
        return
      }

      await clientesService.createCliente(empresaId,{
         nombre: formData.nombre,
  rnc: formData.rnc_cedula, // ✅ aquí usamos el nombre correcto
  email: formData.email,
  telefono: formData.telefono,
  direccion: formData.direccion,
  limite_credito: 0, // si aplica
  balance: 0,        // si aplica
  activo: true,      // si aplica
      })
      toast({
        title: "Éxito",
        description: "Cliente creado correctamente",
      })
      setDialogAbierto(false)
      setFormData({ nombre: "", rnc_cedula: "", email: "", telefono: "", direccion: "" })
      loadCustomers()
    } catch (error: any) {
      console.error("[v0] Error creating customer:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el cliente",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteCustomer(id: string) {
    if (!confirm("¿Está seguro de eliminar este cliente?")) return

    try {
      await clientesService.deleteCliente(id,empresaId)
      toast({
        title: "Éxito",
        description: "Cliente eliminado correctamente",
      })
      loadCustomers()
    } catch (error: any) {
      console.error("[v0] Error deleting customer:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    }
  }

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.rnc_cedula?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy text-balance">Clientes</h1>
              <p className="text-gray-600">Gestión de clientes y cartera</p>
            </div>
            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#001f3d] to-[#003d7a]">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-navy">Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-navy">
                      Nombre/Razón Social *
                    </Label>
                    <Input
                      id="nombre"
                      placeholder="Nombre del cliente"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rnc" className="text-navy">
                      RNC/Cédula
                    </Label>
                    <Input
                      id="rnc"
                      placeholder="000-0000000-0"
                      value={formData.rnc_cedula}
                      onChange={(e) => setFormData({ ...formData, rnc_cedula: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-navy">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        placeholder="809-000-0000"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-navy">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="cliente@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-navy">
                      Dirección
                    </Label>
                    <Input
                      id="direccion"
                      placeholder="Dirección completa"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveCustomer} className="bg-gradient-to-r from-[#001f3d] to-[#003d7a]">
                    Guardar Cliente
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-6 border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="busqueda" className="text-navy">
                    Buscar
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="busqueda"
                      placeholder="Buscar por nombre, RNC o email..."
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
            <Card className="bg-gradient-to-br from-[#001f3d] to-[#003d7a] text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Total Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clientes.length}</div>
                <p className="text-xs text-white/70 mt-1">Clientes registrados</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#001f3d] to-[#003d7a] text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Con Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clientes.filter((c) => c.email).length}</div>
                <p className="text-xs text-white/70 mt-1">Clientes con email</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#001f3d] to-[#003d7a] text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Con Teléfono</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clientes.filter((c) => c.telefono).length}</div>
                <p className="text-xs text-white/70 mt-1">Clientes con teléfono</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-navy">Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#001f3d]" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-navy">Nombre</TableHead>
                      <TableHead className="text-navy">RNC/Cédula</TableHead>
                      <TableHead className="text-navy">Teléfono</TableHead>
                      <TableHead className="text-navy">Email</TableHead>
                      <TableHead className="text-right text-navy">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No se encontraron clientes
                        </TableCell>
                      </TableRow>
                    ) : (
                      clientesFiltrados.map((cliente) => (
                        <TableRow key={cliente.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">{cliente.nombre}</TableCell>
                          <TableCell className="text-gray-600">{cliente.rnc_cedula || "-"}</TableCell>
                          <TableCell className="text-gray-600">{cliente.telefono || "-"}</TableCell>
                          <TableCell className="text-gray-600">{cliente.email || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                <Eye className="h-4 w-4 text-gray-600" />
                              </Button>
                              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                <Edit className="h-4 w-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-red-50"
                                onClick={() => handleDeleteCustomer(cliente.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
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
