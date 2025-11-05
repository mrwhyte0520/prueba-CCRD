"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, DollarSign, Users, TrendingUp, ExternalLink, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReferralData {
  referralCode: string
  totalCommissions: number
  totalReferrals: number
  pendingCommissions: number
  recentReferrals: Array<{
    id: string
    userName: string
    planPurchased: string
    commissionAmount: number
    status: string
    purchaseDate: string
  }>
}

export default function ReferidosPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()

    const loadReferralData = async () => {
      setLoading(true)

      const referralCode = currentUser?.email ? btoa(currentUser.email).substring(0, 8).toUpperCase() : "DEMO1234"

      const mockData: ReferralData = {
        referralCode,
        totalCommissions: 0,
        totalReferrals: 0,
        pendingCommissions: 0,
        recentReferrals: [],
      }

      setReferralData(mockData)
      setLoading(false)
    }

    loadReferralData()
  }, [])

  const getReferralLink = () => {
    if (typeof window === "undefined" || !referralData) return ""
    return `${window.location.origin}/planes?ref=${referralData.referralCode}`
  }

  const copyToClipboard = async () => {
    const link = getReferralLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleWithdraw = () => {
    alert("La integración con PayPal estará disponible próximamente. Tus comisiones están seguras.")
  }

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
                <p className="mt-4 text-gray-600">Cargando datos de referidos...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-navy">Programa de Referidos</h1>
              <p className="text-gray-600">Comparte tu enlace y gana comisiones por cada venta realizada</p>
            </div>

            <Alert className="mb-6 border-navy bg-gradient-to-r from-[#001f3d]/5 to-[#003d7a]/5">
              <TrendingUp className="h-4 w-4 text-navy" />
              <AlertDescription className="text-gray-700">
                <strong className="text-navy">¿Cómo funciona?</strong> Comparte tu enlace personalizado. Cuando alguien
                compre un plan usando tu enlace, ganarás una comisión del 20% del valor del plan.
              </AlertDescription>
            </Alert>

            <div className="mb-6 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Comisiones</CardTitle>
                  <DollarSign className="h-4 w-4 text-navy" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">
                    ${referralData?.totalCommissions.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-gray-600">Acumulado total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Comisiones Pendientes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-navy" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">
                    ${referralData?.pendingCommissions.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-gray-600">Disponible para retirar</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Referidos</CardTitle>
                  <Users className="h-4 w-4 text-navy" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{referralData?.totalReferrals || 0}</div>
                  <p className="text-xs text-gray-600">Personas referidas</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-navy">Tu Enlace de Referido</CardTitle>
                <CardDescription>Comparte este enlace para ganar comisiones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={getReferralLink()} readOnly className="flex-1 font-mono text-sm" />
                  <Button
                    onClick={copyToClipboard}
                    className="bg-gradient-to-r from-[#001f3d] to-[#003d7a] text-white hover:opacity-90"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-navy text-navy">
                    Código: {referralData?.referralCode}
                  </Badge>
                  <span className="text-sm text-gray-600">Comisión: 20% por cada venta</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(`¡Mira este sistema de contabilidad! ${getReferralLink()}`)}`,
                        "_blank",
                      )
                    }
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Compartir en WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Mira este sistema de contabilidad! ${getReferralLink()}`)}`,
                        "_blank",
                      )
                    }
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Compartir en Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-navy">Retirar Comisiones</CardTitle>
                <CardDescription>Retira tus comisiones acumuladas a través de PayPal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-navy">
                      ${referralData?.pendingCommissions.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-gray-600">Disponible para retirar</p>
                  </div>
                  <Button
                    onClick={handleWithdraw}
                    disabled={(referralData?.pendingCommissions || 0) < 10}
                    className="bg-gradient-to-r from-[#001f3d] to-[#003d7a] text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Retirar a PayPal
                  </Button>
                </div>
                {(referralData?.pendingCommissions || 0) < 10 && (
                  <p className="mt-2 text-xs text-gray-500">Mínimo $10.00 para retirar</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-navy">Referidos Recientes</CardTitle>
                <CardDescription>Historial de tus referidos y comisiones</CardDescription>
              </CardHeader>
              <CardContent>
                {referralData?.recentReferrals && referralData.recentReferrals.length > 0 ? (
                  <div className="space-y-4">
                    {referralData.recentReferrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{referral.userName}</p>
                          <p className="text-sm text-gray-600">
                            Plan {referral.planPurchased} • {new Date(referral.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-navy">+${referral.commissionAmount.toFixed(2)}</p>
                          <Badge
                            variant={referral.status === "paid" ? "default" : "outline"}
                            className={
                              referral.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "border-yellow-500 text-yellow-700"
                            }
                          >
                            {referral.status === "paid" ? "Pagado" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-gray-600">Aún no tienes referidos</p>
                    <p className="text-sm text-gray-500">Comparte tu enlace para empezar a ganar comisiones</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
