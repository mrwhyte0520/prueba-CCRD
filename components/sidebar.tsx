"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSidebar } from "@/components/sidebar-context"
import { getCurrentUser, type User } from "@/lib/auth"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  BookOpen,
  Building2,
  FileText,
  Settings,
  ChevronDown,
  Receipt,
  UserCog,
  CreditCard,
  Gift,
  LogOut,
  CreditCardIcon,
} from "lucide-react"
import { useState, useEffect } from "react"
import { hasImpuestosAccess, hasPaidPlan, getCurrentPlanName, cancelSubscription } from "@/lib/subscription"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface MenuItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Punto de Venta",
    icon: ShoppingCart,
    children: [
      { title: "Inventario", href: "/pos/inventario", icon: Package },
      { title: "Nueva Factura", href: "/pos/nueva-factura", icon: FileText },
      { title: "Facturas", href: "/pos/facturas", icon: FileText },
      { title: "Cierre de Caja", href: "/pos/cierre-caja", icon: FileText },
    ],
  },
  {
    title: "Inventario",
    icon: Package,
    children: [
      { title: "Productos", href: "/inventario/productos", icon: Package },
      { title: "Categorías", href: "/inventario/categorias", icon: Package },
      { title: "Almacenes", href: "/inventario/almacenes", icon: Building2 },
      { title: "Conduces", href: "/inventario/conduces", icon: FileText },
    ],
  },
  {
    title: "Clientes",
    icon: Users,
    children: [
      { title: "Lista de Clientes", href: "/clientes", icon: Users },
      { title: "Cuentas por Cobrar", href: "/clientes/cuentas-cobrar", icon: FileText },
      { title: "Cobros", href: "/clientes/cobros", icon: FileText },
      { title: "Reportes", href: "/clientes/reportes", icon: FileText },
    ],
  },
  {
    title: "Suplidores",
    icon: Truck,
    children: [
      { title: "Lista de Suplidores", href: "/suplidores", icon: Truck },
      { title: "Cuentas por Pagar", href: "/suplidores/cuentas-pagar", icon: FileText },
      { title: "Pagos", href: "/suplidores/pagos", icon: FileText },
      { title: "Órdenes de Compra", href: "/suplidores/ordenes-compra", icon: FileText },
      { title: "Reportes", href: "/suplidores/reportes", icon: FileText },
    ],
  },
  {
    title: "Recibos",
    icon: Receipt,
    children: [
      { title: "Recibos de Ingresos", href: "/recibos/ingresos", icon: Receipt },
      { title: "Recibos de Egresos", href: "/recibos/egresos", icon: Receipt },
      { title: "Consulta de Recibos", href: "/recibos/consulta", icon: FileText },
    ],
  },
  {
    title: "Empleados",
    icon: UserCog,
    children: [
      { title: "Lista de Empleados", href: "/empleados", icon: UserCog },
      { title: "Departamentos", href: "/empleados/departamentos", icon: Building2 },
      { title: "Cargos", href: "/empleados/cargos", icon: FileText },
    ],
  },
  {
    title: "Contabilidad",
    icon: BookOpen,
    children: [
      { title: "Catálogo de Cuentas", href: "/contabilidad/catalogo", icon: BookOpen },
      { title: "Asientos Contables", href: "/contabilidad/asientos", icon: FileText },
      { title: "Mayor General", href: "/contabilidad/mayor-general", icon: FileText },
      { title: "Balance General", href: "/contabilidad/balance-general", icon: FileText },
      { title: "Estado de Resultados", href: "/contabilidad/estado-resultados", icon: FileText },
    ],
  },
  {
    title: "Activos Fijos",
    icon: Building2,
    children: [
      { title: "Registro de Activos", href: "/activos-fijos", icon: Building2 },
      { title: "Depreciación", href: "/activos-fijos/depreciacion", icon: FileText },
    ],
  },
  {
    title: "Impuestos",
    icon: FileText,
    children: [
      { title: "Configuración", href: "/impuestos/configuracion", icon: Settings },
      { title: "Formulario IT-1", href: "/impuestos/it1", icon: FileText },
      { title: "Formulario IR-3", href: "/impuestos/ir3", icon: FileText },
      { title: "Formulario IR-17", href: "/impuestos/ir17", icon: FileText },
      { title: "Reporte 606", href: "/impuestos/606", icon: FileText },
      { title: "Reporte 607", href: "/impuestos/607", icon: FileText },
      { title: "Reporte 608", href: "/impuestos/608", icon: FileText },
      { title: "Reporte 623", href: "/impuestos/623", icon: FileText },
      { title: "Gestión de NCF", href: "/impuestos/ncf", icon: FileText },
      { title: "Series Fiscales", href: "/impuestos/series", icon: FileText },
      { title: "Novedades TSS", href: "/impuestos/tss", icon: FileText },
    ],
  },
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
]

function SidebarItem({ item, level = 0 }: { item: MenuItem; level?: number }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const { isOpen: sidebarOpen } = useSidebar()

  useEffect(() => {
    if (hasChildren && item.children) {
      const isActive = item.children.some((child) => pathname === child.href)
      if (isActive) {
        setIsOpen(true)
      }
    }
  }, [pathname, hasChildren, item.children])

  if (hasChildren) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02]",
            level > 0 && "pl-6",
            !sidebarOpen && "justify-center",
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-5 w-5" />
            {sidebarOpen && <span>{item.title}</span>}
          </div>
          {sidebarOpen && (
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
          )}
        </button>
        {isOpen && sidebarOpen && (
          <div className="mt-1 space-y-1 animate-slide-in">
            {item.children?.map((child, index) => (
              <SidebarItem key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] animate-fade-in",
        pathname === item.href && "bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] font-medium shadow-md",
        level > 0 && "pl-6",
        !sidebarOpen && "justify-center",
      )}
    >
      <item.icon className="h-5 w-5" />
      {sidebarOpen && <span>{item.title}</span>}
    </Link>
  )
}

export function Sidebar() {
  const [showImpuestos, setShowImpuestos] = useState(true)
  const { isOpen } = useSidebar()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isPaidPlan, setIsPaidPlan] = useState(false)
  const [planName, setPlanName] = useState("")
  const router = useRouter()

  useEffect(() => {
    setShowImpuestos(hasImpuestosAccess())
    setCurrentUser(getCurrentUser())
    setIsPaidPlan(hasPaidPlan())
    setPlanName(getCurrentPlanName())
  }, [])

  const getUserInitials = (name?: string) => {
    if (!name || typeof name !== "string") return "?"
    const names = name.trim().split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleCancelPlan = () => {
    const userName = currentUser?.name || "Usuario"
    if (confirm(`${userName}, ¿estás seguro de que deseas cancelar tu plan? Serás cambiado al plan Básico.`)) {
      cancelSubscription()
      setIsPaidPlan(false)
      setPlanName("Básico")
      alert(`${userName}, tu plan ha sido cancelado. Ahora estás en el plan Básico.`)
      router.refresh()
    }
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.title === "Impuestos" && !showImpuestos) {
      return false
    }
    return true
  })

  const menuWithExtras = [
    ...filteredMenuItems,
    {
      title: "Referidos",
      href: "/referidos",
      icon: Gift,
    },
    ...(!isPaidPlan
      ? [
          {
            title: "Planes",
            href: "/planes",
            icon: CreditCard,
          },
        ]
      : []),
  ]

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-[#003d7a] bg-gradient-to-b from-[#001f3d] to-[#003d7a] transition-all duration-300",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-white/20 px-4">
        {isOpen ? (
          <Image
            src="/images/design-mode/CC-V1-removebg-preview-3.png"
            alt="Cuentas Claras RD Logo"
            width={150}
            height={40}
            className="object-contain h-max w-10/12"
            priority
          />
        ) : (
          <Image
            src="/images/design-mode/CC-V1-removebg-preview-3.png"
            alt="Cuentas Claras RD Icon"
            width={90}
            height={70}
            className="h-5 w-5 object-contain"
            priority
          />
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
        {menuWithExtras.map((item, index) => (
          <SidebarItem key={index} item={item} />
        ))}
      </nav>
      {isOpen && currentUser && (
        <div className="border-t border-white/20 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                  <span className="text-sm font-medium">{getUserInitials(currentUser?.name)}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{currentUser.name}</p>
                  <p className="text-xs text-white/70">{currentUser.email}</p>
                  {isPaidPlan && (
                    <Badge variant="secondary" className="mt-1 bg-white/20 text-white text-xs">
                      Plan {planName}
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isPaidPlan && (
                <>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Plan: {planName}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCancelPlan} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    <span>Cancelar Plan</span>
                  </DropdownMenuItem>
                </>
              )}
              {!isPaidPlan && (
                <DropdownMenuItem onClick={() => router.push("/planes")} className="flex items-center gap-2">
                  <CreditCardIcon className="h-4 w-4" />
                  <span>Ver Planes</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
