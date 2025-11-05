"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Briefcase } from "lucide-react"

interface Cargo {
  id: string
  nombre: string
  departamento: string
  salarioMin: number
  salarioMax: number
  empleados: number
}

export default function CargosPage() {
  const [cargos, setCargos] = useState<Cargo[]>([
    { id: "1", nombre: "Vendedor", departamento: "Ventas", salarioMin: 20000, salarioMax: 30000, empleados: 5 },
    { id: "2", nombre: "Contador", departamento: "Contabilidad", salarioMin: 30000, salarioMax: 45000, empleados: 2 },
    { id: "3", nombre: "Almacenista", departamento: "Almacén", salarioMin: 18000, salarioMax: 25000, empleados: 4 },
    { id: "4", nombre: "Gerente", departamento: "Administración", salarioMin: 50000, salarioMax: 80000, empleados: 1 },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    departamento: "",
    salarioMin: "",
    salarioMax: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nuevoCargo: Cargo = {
      id: (cargos.length + 1).toString(),
      nombre: formData.nombre,
      departamento: formData.departamento,
      salarioMin: Number.parseFloat(formData.salarioMin),
      salarioMax: Number.parseFloat(formData.salarioMax),
      empleados: 0,
    }
    setCargos([...cargos, nuevoCargo])
    setIsDialogOpen(false)
    setFormData({ nombre: "", departamento: "", salarioMin: "", salarioMax: "" })
  }

  const handleDelete = (id: string) => {
    setCargos(cargos.filter((cargo) => cargo.id !== id))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Cargos</h1>
              <p className="text-muted-foreground">Gestiona los cargos y posiciones de la empresa</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Cargo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Cargo</DialogTitle>
                  <DialogDescription>Complete la información del cargo</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre del Cargo *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento *</Label>
                      <Select
                        value={formData.departamento}
                        onValueChange={(value) => setFormData({ ...formData, departamento: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ventas">Ventas</SelectItem>
                          <SelectItem value="Contabilidad">Contabilidad</SelectItem>
                          <SelectItem value="Almacén">Almacén</SelectItem>
                          <SelectItem value="Administración">Administración</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salarioMin">Salario Mínimo *</Label>
                        <Input
                          id="salarioMin"
                          type="number"
                          placeholder="0.00"
                          value={formData.salarioMin}
                          onChange={(e) => setFormData({ ...formData, salarioMin: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salarioMax">Salario Máximo *</Label>
                        <Input
                          id="salarioMax"
                          type="number"
                          placeholder="0.00"
                          value={formData.salarioMax}
                          onChange={(e) => setFormData({ ...formData, salarioMax: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Cargos</CardTitle>
              <CardDescription>Gestiona los cargos disponibles en la empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Rango Salarial</TableHead>
                    <TableHead>Empleados</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cargos.map((cargo) => (
                    <TableRow key={cargo.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {cargo.nombre}
                        </div>
                      </TableCell>
                      <TableCell>{cargo.departamento}</TableCell>
                      <TableCell>
                        ${cargo.salarioMin.toLocaleString("es-DO")} - ${cargo.salarioMax.toLocaleString("es-DO")}
                      </TableCell>
                      <TableCell>{cargo.empleados}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(cargo.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
