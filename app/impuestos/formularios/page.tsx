"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye, Send, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"

interface Formulario {
  id: string
  tipo: string
  nombre: string
  periodo: string
  fechaVencimiento: string
  estado: "Pendiente" | "Generado" | "Enviado" | "Vencido"
  monto?: number
}

const mockFormularios: Formulario[] = [
  {
    id: "1",
    tipo: "IT-1",
    nombre: "Declaración Jurada y/o Pago ITBIS",
    periodo: "Marzo 2024",
    fechaVencimiento: "2024-04-20",
    estado: "Enviado",
    monto: 125000,
  },
  {
    id: "2",
    tipo: "IR-17",
    nombre: "Declaración Jurada ISR Personas Jurídicas",
    periodo: "Año 2023",
    fechaVencimiento: "2024-04-30",
    estado: "Generado",
    monto: 450000,
  },
  {
    id: "3",
    tipo: "606",
    nombre: "Declaración de Compras",
    periodo: "Marzo 2024",
    fechaVencimiento: "2024-04-15",
    estado: "Pendiente",
  },
  {
    id: "4",
    tipo: "607",
    nombre: "Declaración de Ventas",
    periodo: "Marzo 2024",
    fechaVencimiento: "2024-04-15",
    estado: "Pendiente",
  },
  {
    id: "5",
    tipo: "608",
    nombre: "Declaración de Cancelaciones",
    periodo: "Marzo 2024",
    fechaVencimiento: "2024-04-15",
    estado: "Generado",
  },
  {
    id: "6",
    tipo: "IT-1",
    nombre: "Declaración Jurada y/o Pago ITBIS",
    periodo: "Febrero 2024",
    fechaVencimiento: "2024-03-20",
    estado: "Enviado",
    monto: 118500,
  },
]

export default function FormulariosPage() {
  const [formularios] = useState<Formulario[]>(mockFormularios)
  const [filterTipo, setFilterTipo] = useState("all")
  const [filterEstado, setFilterEstado] = useState("all")

  const filteredFormularios = formularios.filter((form) => {
    const matchesTipo = filterTipo === "all" || form.tipo === filterTipo
    const matchesEstado = filterEstado === "all" || form.estado === filterEstado
    return matchesTipo && matchesEstado
  })

  const pendientes = formularios.filter((f) => f.estado === "Pendiente").length
  const generados = formularios.filter((f) => f.estado === "Generado").length
  const enviados = formularios.filter((f) => f.estado === "Enviado").length

  const tiposFormularios = Array.from(new Set(formularios.map((f) => f.tipo)))

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return <Clock className="h-4 w-4" />
      case "Generado":
        return <FileText className="h-4 w-4" />
      case "Enviado":
        return <CheckCircle className="h-4 w-4" />
      case "Vencido":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Formularios DGII</h1>
        <p className="text-muted-foreground">Gestión de declaraciones y formularios fiscales</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendientes}</div>
            <p className="text-xs text-muted-foreground">Por generar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generados</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generados}</div>
            <p className="text-xs text-muted-foreground">Listos para enviar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enviados}</div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Formularios</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formularios.length}</div>
            <p className="text-xs text-muted-foreground">En el sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Formularios Fiscales</CardTitle>
              <CardDescription>Lista de declaraciones y formularios DGII</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tiposFormularios.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Generado">Generado</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Tipo</th>
                    <th className="p-3 text-left text-sm font-medium">Nombre</th>
                    <th className="p-3 text-left text-sm font-medium">Período</th>
                    <th className="p-3 text-left text-sm font-medium">Vencimiento</th>
                    <th className="p-3 text-right text-sm font-medium">Monto</th>
                    <th className="p-3 text-left text-sm font-medium">Estado</th>
                    <th className="p-3 text-center text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFormularios.map((form) => (
                    <tr key={form.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm font-medium">{form.tipo}</td>
                      <td className="p-3 text-sm">{form.nombre}</td>
                      <td className="p-3 text-sm">{form.periodo}</td>
                      <td className="p-3 text-sm">{new Date(form.fechaVencimiento).toLocaleDateString()}</td>
                      <td className="p-3 text-right text-sm">
                        {form.monto ? `RD$ ${form.monto.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-3 text-sm">
                        <Badge
                          variant={
                            form.estado === "Enviado"
                              ? "default"
                              : form.estado === "Generado"
                                ? "secondary"
                                : form.estado === "Vencido"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="flex items-center gap-1 w-fit"
                        >
                          {getEstadoIcon(form.estado)}
                          {form.estado}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {form.estado === "Pendiente" && (
                            <Button variant="outline" size="sm">
                              <FileText className="mr-1 h-3 w-3" />
                              Generar
                            </Button>
                          )}
                          {form.estado === "Generado" && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Send className="mr-1 h-3 w-3" />
                                Enviar
                              </Button>
                            </>
                          )}
                          {form.estado === "Enviado" && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Información sobre Formularios DGII</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>IT-1:</strong> Declaración Jurada y/o Pago del ITBIS (mensual)
          </p>
          <p>
            <strong>IR-17:</strong> Declaración Jurada del ISR para Personas Jurídicas (anual)
          </p>
          <p>
            <strong>606:</strong> Declaración Informativa de Compras (mensual)
          </p>
          <p>
            <strong>607:</strong> Declaración Informativa de Ventas (mensual)
          </p>
          <p>
            <strong>608:</strong> Declaración de Cancelaciones y Modificaciones (mensual)
          </p>
          <p>
            <strong>623:</strong> Declaración de Retenciones de ISR (mensual)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
