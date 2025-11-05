"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Gift, GraduationCap } from "lucide-react"
import { plans, getCurrentPlan, type PlanType } from "@/lib/subscription"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function PlanesPage() {
  const [currentPlan, setCurrentPlanState] = useState<PlanType>(getCurrentPlan())
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Check for referral code in URL
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
      // Store referral code in localStorage for tracking
      localStorage.setItem("referral_code", refCode)
    }
  }, [searchParams])

  const handleSelectPlan = (planId: PlanType) => {
    if (planId === "estudiantes") {
      router.push("/estudiantes/login")
      return
    }

    if (planId === "basico") {
      const currentUser = JSON.parse(localStorage.getItem("current_user") || "{}")
      currentUser.subscription_plan = "basico"
      localStorage.setItem("current_user", JSON.stringify(currentUser))

      setCurrentPlanState("basico")

      toast({
        title: "Plan Básico Activado",
        description: "Tu plan básico ha sido activado exitosamente. ¡Comienza a usar la aplicación!",
      })

      setTimeout(() => {
        router.push("/")
      }, 1500)
      return
    }

    const refParam = referralCode ? `&ref=${referralCode}` : ""
    router.push(`/pago?plan=${planId}${refParam}`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-navy">Planes y Precios</h1>
              <p className="text-gray-600">Elige el plan que mejor se adapte a tu negocio</p>
              <Badge variant="outline" className="mt-4 border-navy text-navy">
                Modo Prueba - Cambia de plan cuando quieras
              </Badge>
            </div>

            {referralCode && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <Gift className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>¡Código de referido aplicado!</strong> Has sido referido con el código{" "}
                  <span className="font-mono font-semibold">{referralCode}</span>. Tu referidor ganará una comisión
                  cuando compres un plan.
                </AlertDescription>
              </Alert>
            )}

            <Card className="mb-6 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-navy">Plan Estudiantes</CardTitle>
                      <CardDescription className="text-base">
                        Todas las funciones Pro con correo institucional
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-navy">$29</div>
                    <div className="text-sm text-gray-600">/mes</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-blue-500" />
                      Dashboard avanzado con KPIs
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-blue-500" />
                      Registros ilimitados en todos los módulos
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-blue-500" />
                      Módulo de impuestos completo
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-blue-500" />
                      Requiere correo institucional (.edu)
                    </li>
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan("estudiantes")}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90"
                  >
                    Acceder como Estudiante
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              {Object.values(plans)
                .filter((plan) => plan.id !== "estudiantes")
                .map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      currentPlan === plan.id ? "border-2 border-navy shadow-lg" : "border border-gray-200"
                    }`}
                  >
                    {currentPlan === plan.id && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        
                      </div>
                    )}
                    {plan.id === "pro" && currentPlan !== "pro" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-[#001f3d] to-[#003d7a] text-white">Recomendado</Badge>
                      </div>
                    )}
                    {plan.id === "basico" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-green-500 text-white">Gratis</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl text-navy">{plan.name}</CardTitle>
                      <CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-navy">${plan.price}</span>
                          <span className="text-gray-600">/mes</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="mb-6 space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={currentPlan === plan.id}
                        className={`w-full ${
                          currentPlan === plan.id
                            ? "bg-gray-300 text-gray-600"
                            : plan.id === "basico"
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gradient-to-r from-[#001f3d] to-[#003d7a] text-white hover:opacity-90"
                        }`}
                      >
                        {currentPlan === plan.id
                          ? "Plan Actual"
                          : plan.id === "basico"
                            ? "Activar Gratis"
                            : "Seleccionar Plan"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-navy">Comparación de Planes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-left text-sm font-medium text-gray-700">Característica</th>
                      <th className="pb-3 text-center text-sm font-medium text-gray-700">Estudiantes</th>
                      <th className="pb-3 text-center text-sm font-medium text-gray-700">Básico</th>
                      <th className="pb-3 text-center text-sm font-medium text-gray-700">Intermedio</th>
                      <th className="pb-3 text-center text-sm font-medium text-gray-700">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 text-sm text-gray-700">Dashboard Avanzado</td>
                      <td className="py-3 text-center">
                        <Check className="mx-auto h-5 w-5 text-navy" />
                      </td>
                      <td className="py-3 text-center">-</td>
                      <td className="py-3 text-center">-</td>
                      <td className="py-3 text-center">
                        <Check className="mx-auto h-5 w-5 text-navy" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-700">Módulo de Impuestos</td>
                      <td className="py-3 text-center">
                        <Check className="mx-auto h-5 w-5 text-navy" />
                      </td>
                      <td className="py-3 text-center">-</td>
                      <td className="py-3 text-center">
                        <Check className="mx-auto h-5 w-5 text-navy" />
                      </td>
                      <td className="py-3 text-center">
                        <Check className="mx-auto h-5 w-5 text-navy" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-700">Límite de Productos</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                      <td className="py-3 text-center text-sm">5</td>
                      <td className="py-3 text-center text-sm">15</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-700">Límite de Clientes</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                      <td className="py-3 text-center text-sm">5</td>
                      <td className="py-3 text-center text-sm">15</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-700">Límite de Empleados</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                      <td className="py-3 text-center text-sm">2</td>
                      <td className="py-3 text-center text-sm">15</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-700">Límite de Suplidores</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                      <td className="py-3 text-center text-sm">3</td>
                      <td className="py-3 text-center text-sm">15</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-700">Facturas Diarias</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                      <td className="py-3 text-center text-sm">3 por día</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                      <td className="py-3 text-center text-sm">Ilimitado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
