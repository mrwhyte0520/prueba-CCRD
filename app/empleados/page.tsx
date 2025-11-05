"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Users, DollarSign } from "lucide-react"
import { Building2 } from "lucide-react" // Import Building2 icon
import { Loader2 } from "lucide-react"
import { getEmployees, createEmployee, deleteEmployee, getDepartments } from "@/lib/supabase/helpers"
import { useToast } from "@/hooks/use-toast"
import { checkSubscriptionLimit } from "@/lib/subscription"

interface Empleado {
  id: string
  codigo: string
  cedula: string
  nss: string
  nombre: string
  apellido: string
  departamento: string
  cargo: string
  salario: number
  fechaIngreso: string
  estado: "Activo" | "Inactivo" | "Vacaciones"
  telefono: string
  email: string
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<any[]>([])
  const [departamentos, setDepartamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    cedula: "",
    nss: "",
    first_name: "",
    last_name: "",
    department_id: "",
    position: "",
    salary: "",
    hire_date: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [employeesData, departmentsData] = await Promise.all([getEmployees(), getDepartments()])
      setEmpleados(employeesData)
      setDepartamentos(departmentsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const canAdd = await checkSubscriptionLimit("employees", empleados.length)
    if (!canAdd) {
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite de empleados para tu plan.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await createEmployee({
        cedula: formData.cedula,
        nss: formData.nss,
        first_name: formData.first_name,
        last_name: formData.last_name,
        department_id: formData.department_id,
        position: formData.position,
        salary: Number.parseFloat(formData.salary),
        hire_date: formData.hire_date,
        phone: formData.phone,
        email: formData.email,
        status: "active",
      })

      toast({
        title: "Empleado creado",
        description: "El empleado se ha guardado correctamente",
      })

      setIsDialogOpen(false)
      setFormData({
        cedula: "",
        nss: "",
        first_name: "",
        last_name: "",
        department_id: "",
        position: "",
        salary: "",
        hire_date: "",
        phone: "",
        email: "",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el empleado",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este empleado?")) return

    try {
      await deleteEmployee(id)
      toast({
        title: "Empleado eliminado",
        description: "El empleado se ha eliminado correctamente",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive",
      })
    }
  }

  const filteredEmpleados = empleados.filter(
    (emp) =>
      emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cedula?.includes(searchTerm),
  )

  const empleadosActivos = empleados.filter((emp) => emp.status === "active").length
  const nominaTotal = empleados.reduce((sum, emp) => sum + (emp.salary || 0), 0)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-navy text-3xl font-bold">Gestión de Empleados</h1>
              <p className="text-muted-foreground">Administra la información del personal</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
                  <DialogDescription>Complete la información del empleado</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cedula">Cédula *</Label>
                        <Input
                          id="cedula"
                          placeholder="001-0000000-0"
                          value={formData.cedula}
                          onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nss">NSS (Seguro Social) *</Label>
                        <Input
                          id="nss"
                          placeholder="12345678901"
                          value={formData.nss}
                          onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido *</Label>
                        <Input
                          id="apellido"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="departamento">Departamento *</Label>
                        <Select
                          value={formData.department_id}
                          onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {departamentos.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo *</Label>
                        <Input
                          id="cargo"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salario">Salario Mensual *</Label>
                        <Input
                          id="salario"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.salary}
                          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
                        <Input
                          id="fechaIngreso"
                          type="date"
                          value={formData.hire_date}
                          onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          placeholder="809-555-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="empleado@empresa.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Empleado
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{empleados.length}</div>
                <p className="text-xs text-muted-foreground">{empleadosActivos} activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nómina Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${nominaTotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">Mensual</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(empleados.map((emp) => emp.departamento)).size}</div>
                <p className="text-xs text-muted-foreground">Activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Salario</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(nominaTotal / empleados.length).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">Por empleado</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Empleados</CardTitle>
                  <CardDescription>Gestiona la información del personal</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar empleado..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
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
                      <TableHead>Cédula</TableHead>
                      <TableHead>NSS</TableHead>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Salario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmpleados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No se encontraron empleados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmpleados.map((empleado) => (
                        <TableRow key={empleado.id}>
                          <TableCell>{empleado.cedula}</TableCell>
                          <TableCell>{empleado.nss}</TableCell>
                          <TableCell>
                            {empleado.first_name} {empleado.last_name}
                          </TableCell>
                          <TableCell>{empleado.position}</TableCell>
                          <TableCell>RD$ {empleado.salary?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={empleado.status === "active" ? "default" : "secondary"}>
                              {empleado.status === "active" ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(empleado.id)}>
                                <Trash2 className="h-4 w-4" />
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
