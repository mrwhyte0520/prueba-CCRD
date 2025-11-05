"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCurrentPlan } from "@/lib/subscription"
import { useEffect, useState } from "react"

export function UpgradeBanner() {
  const [currentPlan, setCurrentPlan] = useState<string>("basico")

  useEffect(() => {
    setCurrentPlan(getCurrentPlan())
  }, [])

  if (currentPlan === "pro") return null

  return (
    <Alert className="mb-6 border-navy bg-gradient-to-r from-[#001f3d]/5 to-[#003d7a]/5">
      <Sparkles className="h-4 w-4 text-navy" />
      <AlertTitle className="text-navy">
        {currentPlan === "basico" ? "Desbloquea más funciones" : "Actualiza al Plan Pro"}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="text-gray-700">
          {currentPlan === "basico"
            ? "Actualiza tu plan para acceder a impuestos, KPIs avanzados y sin límites."
            : "Actualiza al plan Pro para eliminar todos los límites y acceder a KPIs avanzados."}
        </span>
        <Link href="/planes">
          <Button className="ml-4 bg-gradient-to-r from-[#001f3d] to-[#003d7a] text-white hover:opacity-90">
            Ver Planes
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
