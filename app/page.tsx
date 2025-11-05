"use client"
import {  PieLabelRenderProps } from "recharts";
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Users, Package, TrendingUp, TrendingDown } from "lucide-react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { hasAdvancedDashboard } from "@/lib/subscription"
import * as facturasService from "@/lib/services/facturas.service"
import * as clientesService from "@/lib/services/clientes.service"
import * as productosService from "@/lib/services/productos.service"
import * as cuentasCobrarService from "@/lib/services/cuentas-cobrar.service"

export default function DashboardPage() {
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ventasMes, setVentasMes] = useState(0)
  const [facturasPendientes, setFacturasPendientes] = useState(0)
  const [clientesActivos, setClientesActivos] = useState(0)
  const [productosStock, setProductosStock] = useState(0)
  const [ventasRecientes, setVentasRecientes] = useState<any[]>([])
  const [cuentasPorCobrarData, setCuentasPorCobrarData] = useState<any[]>([])

  useEffect(() => {
    setIsAdvanced(hasAdvancedDashboard())
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const empresaId = "8459a58c-01ad-44f5-b6dd-7fe7ad82b501"

      // Get current month's sales
      const facturas = await facturasService.getFacturas(empresaId)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const facturasMes = facturas.filter((f: any) => {
        const fecha = new Date(f.fecha)
        return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear
      })
      const totalVentas = facturasMes.reduce((sum: number, f: any) => sum + f.total, 0)
      setVentasMes(totalVentas)

      // Get pending invoices
      const pendientes = facturas.filter((f: any) => f.estado === "pendiente").length
      setFacturasPendientes(pendientes)

      // Get active clients
      const clientes = await clientesService.getClientes(empresaId)
      setClientesActivos(clientes.length)

      // Get products in stock
      const productos = await productosService.getProductos(empresaId)
      const totalStock = productos.reduce((sum: number, p: any) => sum + (p.stock || 0), 0)
      setProductosStock(totalStock)

      // Get recent sales (last 5)
      const recientes = facturas
        .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5)
      setVentasRecientes(recientes)

      // Get accounts receivable by age
      const cuentasCobrar = await cuentasCobrarService.getCuentasPorCobrar(empresaId)
      const aging = {
        "0-30": 0,
        "31-60": 0,
        "61-90": 0,
        "+90": 0,
      }

      cuentasCobrar.forEach((cuenta: any) => {
        const dias = cuenta.dias_vencido || 0
        if (dias <= 30) aging["0-30"] += cuenta.balance
        else if (dias <= 60) aging["31-60"] += cuenta.balance
        else if (dias <= 90) aging["61-90"] += cuenta.balance
        else aging["+90"] += cuenta.balance
      })

      setCuentasPorCobrarData([
        { name: "0-30 días", value: aging["0-30"], color: "#001f3d" },
        { name: "31-60 días", value: aging["31-60"], color: "#003d7a" },
        { name: "61-90 días", value: aging["61-90"], color: "#0055aa" },
        { name: "+90 días", value: aging["+90"], color: "#3b82f6" },
      ])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    {
      title: "Ventas del Mes",
      value: `RD$ ${ventasMes.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Facturas Pendientes",
      value: facturasPendientes.toString(),
      change: "-5.2%",
      trend: "down",
      icon: FileText,
    },
    {
      title: "Clientes Activos",
      value: clientesActivos.toString(),
      change: "+5.1%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Productos en Stock",
      value: productosStock.toLocaleString(),
      change: "-3.2%",
      trend: "down",
      icon: Package,
    },
  ]

  const ventasComprasData = [
    { mes: "Jul", ventas: 1800000, compras: 1200000 },
    { mes: "Ago", ventas: 2100000, compras: 1400000 },
    { mes: "Sep", ventas: 1950000, compras: 1300000 },
    { mes: "Oct", ventas: 2300000, compras: 1600000 },
    { mes: "Nov", ventas: 2200000, compras: 1500000 },
    { mes: "Dic", ventas: 2800000, compras: 1900000 },
    { mes: "Ene", ventas: 2450000, compras: 1650000 },
  ]

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!isAdvanced) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-white p-6">
            <div className="mb-6">
              <h1 className="text-balance text-3xl font-bold text-navy">Dashboard</h1>
              <p className="text-gray-600">Resumen general de tu negocio</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-gray-200 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Ventas del Mes</CardTitle>
                  <DollarSign className="h-5 w-5 text-navy" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">RD$ {ventasMes.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Facturas Pendientes</CardTitle>
                  <FileText className="h-5 w-5 text-navy" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{facturasPendientes}</div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Clientes Activos</CardTitle>
                  <Users className="h-5 w-5 text-navy" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{clientesActivos}</div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Productos en Stock</CardTitle>
                  <Package className="h-5 w-5 text-navy" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{productosStock}</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card className="border-gray-200 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-navy">Ventas Recientes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-3 text-left text-sm font-semibold text-navy">Factura</th>
                          <th className="pb-3 text-left text-sm font-semibold text-navy">Cliente</th>
                          <th className="pb-3 text-left text-sm font-semibold text-navy">Fecha</th>
                          <th className="pb-3 text-right text-sm font-semibold text-navy">Total</th>
                          <th className="pb-3 text-right text-sm font-semibold text-navy">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventasRecientes.map((venta, index) => (
                          <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                            <td className="py-3 text-sm font-medium text-gray-900">{venta.numero}</td>
                            <td className="py-3 text-sm text-gray-700">{venta.cliente_nombre || "N/A"}</td>
                            <td className="py-3 text-sm text-gray-600">
                              {new Date(venta.fecha).toLocaleDateString("es-DO")}
                            </td>
                            <td className="py-3 text-right text-sm font-semibold text-gray-900">
                              RD$ {venta.total.toLocaleString()}
                            </td>
                            <td className="py-3 text-right">
                              <Badge
                                variant={venta.estado === "pagada" ? "default" : "secondary"}
                                className={
                                  venta.estado === "pagada"
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                }
                              >
                                {venta.estado === "pagada" ? "Pagada" : "Pendiente"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
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
        <main className="flex-1 overflow-y-auto bg-white p-6">
          <div className="mb-6">
            <h1 className="text-balance text-3xl font-bold text-navy">Dashboard Principal</h1>
            <p className="text-gray-600">Resumen general de tu negocio</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, index) => (
              <Card key={index} className="border-none bg-gradient-to-br from-[#001f3d] to-[#003d7a] shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">{kpi.title}</CardTitle>
                  <kpi.icon className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{kpi.value}</div>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-300" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-300" />
                    )}
                    <span className={kpi.trend === "up" ? "text-green-300" : "text-red-300"}>{kpi.change}</span>
                    <span className="text-white/70">vs mes anterior</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="border-gray-200 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-navy">Ventas vs Compras</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer
                  config={{
                    ventas: {
                      label: "Ventas",
                      color: "#001f3d",
                    },
                    compras: {
                      label: "Compras",
                      color: "#003d7a",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ventasComprasData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="mes" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ventas"
                        stroke="#001f3d"
                        strokeWidth={3}
                        name="Ventas"
                        dot={{ fill: "#001f3d", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="compras"
                        stroke="#003d7a"
                        strokeWidth={3}
                        name="Compras"
                        dot={{ fill: "#003d7a", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-navy">Cuentas por Cobrar por Antigüedad</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer
                  config={{
                    value: {
                      label: "Monto",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
  <PieChart>
    <Pie
      data={cuentasPorCobrarData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={(props: PieLabelRenderProps) => {
        const { name, percent } = props;
        return `${name}: ${(Number(percent ?? 0) * 100).toFixed(0)}%`;;
      }}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {cuentasPorCobrarData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <ChartTooltip content={<ChartTooltipContent />} />
  </PieChart>
</ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {cuentasPorCobrarData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-semibold text-navy">RD$ {item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="border-gray-200 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-navy">Ventas Recientes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 text-left text-sm font-semibold text-navy">Factura</th>
                        <th className="pb-3 text-left text-sm font-semibold text-navy">Cliente</th>
                        <th className="pb-3 text-left text-sm font-semibold text-navy">Fecha</th>
                        <th className="pb-3 text-right text-sm font-semibold text-navy">Total</th>
                        <th className="pb-3 text-right text-sm font-semibold text-navy">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasRecientes.map((venta, index) => (
                        <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="py-3 text-sm font-medium text-gray-900">{venta.numero}</td>
                          <td className="py-3 text-sm text-gray-700">{venta.cliente_nombre || "N/A"}</td>
                          <td className="py-3 text-sm text-gray-600">
                            {new Date(venta.fecha).toLocaleDateString("es-DO")}
                          </td>
                          <td className="py-3 text-right text-sm font-semibold text-gray-900">
                            RD$ {venta.total.toLocaleString()}
                          </td>
                          <td className="py-3 text-right">
                            <Badge
                              variant={venta.estado === "pagada" ? "default" : "secondary"}
                              className={
                                venta.estado === "pagada"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              }
                            >
                              {venta.estado === "pagada" ? "Pagada" : "Pendiente"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
