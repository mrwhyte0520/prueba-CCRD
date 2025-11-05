"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // No verificar autenticación en la página de login
    if (pathname === "/login") return

    // Verificar si el usuario está autenticado
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [pathname, router])

  // Si estamos en la página de login, mostrar el contenido sin verificar
  if (pathname === "/login") {
    return <>{children}</>
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated()) {
    return null
  }

  return <>{children}</>
}
