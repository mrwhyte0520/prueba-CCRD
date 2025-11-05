"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react"
import { plans, type PlanType } from "@/lib/subscription"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser } from "@/lib/auth"

export default function PagoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [processing, setProcessing] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [commission, setCommission] = useState<number>(0)

  useEffect(() => {
    const planId = searchParams.get("plan") as PlanType
    const refCode = searchParams.get("ref") || localStorage.getItem("referral_code")

    if (!planId || !plans[planId]) {
      router.push("/planes")
      return
    }

    setSelectedPlan(planId)

    if (refCode) {
      setReferralCode(refCode)
      // Calculate 20% commission
      const planCommission = plans[planId].price * 0.2
      setCommission(planCommission)
    }
  }, [searchParams, router])

  const handlePayment = async () => {
    if (!selectedPlan) return

    setProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // TODO: Integrate with Stripe API here
    // This is where the Stripe payment processing will be implemented
    console.log("[v0] Processing payment for plan:", selectedPlan)
    console.log("[v0] Referral code:", referralCode)
    console.log("[v0] Commission:", commission)

    localStorage.setItem("subscription_plan", selectedPlan)

    if (referralCode && commission > 0) {
      const currentUser = getCurrentUser()
      if (currentUser) {
        // Get existing commissions
        const commissionsStr = localStorage.getItem("referral_commissions")
        let commissions: Array<{
          referrerId: string
          amount: number
          plan: string
          date: string
          status: string
        }> = []

        if (commissionsStr) {
          try {
            commissions = JSON.parse(commissionsStr)
          } catch {
            commissions = []
          }
        }

        // Add new commission
        commissions.push({
          referrerId: referralCode,
          amount: commission,
          plan: plans[selectedPlan].name,
          date: new Date().toISOString(),
          status: "pending",
        })

        localStorage.setItem("referral_commissions", JSON.stringify(commissions))

        // Update referrer's total commissions
        const referralsStr = localStorage.getItem("referrals")
        if (referralsStr) {
          try {
            const referrals = JSON.parse(referralsStr)
            const referrerData = referrals.find((r: any) => r.userId === referralCode)
            if (referrerData) {
              referrerData.totalCommissions = (referrerData.totalCommissions || 0) + commission
              referrerData.pendingCommissions = (referrerData.pendingCommissions || 0) + commission
              localStorage.setItem("referrals", JSON.stringify(referrals))
            }
          } catch (e) {
            console.error("Error updating referrer commissions:", e)
          }
        }
      }
    }

    alert(
      `¡Pago procesado exitosamente!\n\n` +
        `Plan: ${plans[selectedPlan].name}\n` +
        `Precio: $${plans[selectedPlan].price}\n\n` +
        `Tu plan ha sido activado. Serás redirigido al dashboard.`,
    )

    setProcessing(false)

    router.push("/")
  }

  if (!selectedPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  const plan = plans[selectedPlan]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => router.push("/planes")} className="mb-6 text-navy">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a planes
        </Button>

        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-navy">Completar Pago</h1>
          <p className="text-gray-600">Estás a un paso de activar tu plan</p>
        </div>

        {referralCode && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Código de referido aplicado:</strong> {referralCode}
              <br />
              Tu referidor ganará ${commission.toFixed(2)} de comisión con esta compra.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan Summary */}
          <Card className="border-2 border-navy">
            <CardHeader>
              <CardTitle className="text-2xl text-navy">Resumen del Plan</CardTitle>
              <CardDescription>Detalles de tu suscripción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gradient-to-br from-navy to-[#003d7a] p-6 text-white">
                <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-200">/mes</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-navy">Características incluidas:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-navy">${plan.price.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between text-lg font-bold">
                  <span className="text-navy">Total</span>
                  <span className="text-navy">${plan.price.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-navy">
                <CreditCard className="h-6 w-6" />
                Información de Pago
              </CardTitle>
              <CardDescription>Integración con Stripe próximamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-500 bg-blue-50">
                <Lock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <strong>Pago seguro:</strong> La integración con Stripe garantizará transacciones 100% seguras.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                  <Input id="cardName" placeholder="Juan Pérez" disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número de tarjeta</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Fecha de expiración</Label>
                    <Input id="expiry" placeholder="MM/AA" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" disabled />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-2 font-medium text-gray-700">Integración de Stripe en desarrollo</p>
                <p className="text-sm text-gray-600">
                  El formulario de pago real estará disponible próximamente con procesamiento seguro de Stripe.
                </p>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-gradient-to-r from-navy to-[#003d7a] text-lg font-semibold text-white hover:opacity-90"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Pagar ${plan.price.toFixed(2)} (Modo Prueba)
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                Al continuar, aceptas nuestros términos de servicio y política de privacidad
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-navy">Pago 100% Seguro</h3>
                <p className="text-sm text-gray-600">
                  Todos los pagos serán procesados de forma segura a través de Stripe. Tu información financiera está
                  protegida con encriptación de nivel bancario.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
