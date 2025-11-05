"use client"

import type React from "react"

import { Bell, Search, LogOut, User, Menu, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { logout, getCurrentUser } from "@/lib/auth"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSidebar } from "@/components/sidebar-context"

const mockNotifications = [
  {
    id: 1,
    type: "success",
    title: "Pago recibido",
    message: "Se ha registrado un pago de RD$15,000.00",
    time: "Hace 5 minutos",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Producto bajo en stock",
    message: "El producto 'Laptop Dell' tiene solo 3 unidades disponibles",
    time: "Hace 1 hora",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Nueva factura pendiente",
    message: "Factura #00125 requiere aprobación",
    time: "Hace 2 horas",
    read: false,
  },
  {
    id: 4,
    type: "success",
    title: "Cierre de caja completado",
    message: "El cierre de caja del día 28/10/2025 fue exitoso",
    time: "Ayer",
    read: true,
  },
]

export function Header() {
  const router = useRouter()
  const user = getCurrentUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const { toggle } = useSidebar()

  const handleLogout = () => {
    logout()
    router.push("/login")
    window.location.href = "/login"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Aquí se implementaría la lógica de búsqueda
      alert(`Buscando: ${searchQuery}`)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const unreadCount = mockNotifications.filter((n) => !n.read).length

  return (
    <header className="flex h-16 items-center justify-between border-b-2 border-[#1e3a8a] bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggle} className="hover:bg-[#1e3a8a]/10 text-[#1e3a8a]">
          <Menu className="h-5 w-5" />
        </Button>
        <form onSubmit={handleSearch} className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e3a8a]" />
          <Input
            type="search"
            placeholder="Buscar clientes, productos, facturas..."
            className="pl-10 border-[#1e3a8a]/20 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      <div className="flex items-center gap-4">
        <Popover open={showNotifications} onOpenChange={setShowNotifications}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-[#1e3a8a]/10 text-[#1e3a8a]">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="font-semibold text-[#1e3a8a]">Notificaciones</h3>
              {unreadCount > 0 && <span className="text-xs text-gray-600">{unreadCount} nuevas</span>}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {mockNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-4 py-2">
              <Button variant="ghost" className="w-full text-sm text-[#1e3a8a] hover:bg-[#1e3a8a]/10">
                Ver todas las notificaciones
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-[#1e3a8a]/10 text-[#1e3a8a]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-[#1e3a8a]">{user?.name}</p>
                <p className="text-xs leading-none text-gray-600">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
