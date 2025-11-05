"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface LimitAlertProps {
  module: string
  current: number
  limit: number
}

export function LimitAlert({ module, current, limit }: LimitAlertProps) {
  if (current < limit) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Límite Alcanzado</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Has alcanzado el límite de {limit} {module} en tu plan actual. Actualiza tu plan para agregar más.
        </span>
        <Link href="/planes">
          <Button variant="outline" size="sm" className="ml-4 bg-transparent">
            Ver Planes
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
