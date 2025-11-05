"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Lock, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { studentLogin, studentRegister, isInstitutionalEmail } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StudentLoginPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Validate institutional email
    if (!isInstitutionalEmail(email)) {
      setError("Debes usar un correo institucional (.edu, .edu.do, etc.)")
      setLoading(false)
      return
    }

    if (isRegister) {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        setLoading(false)
        return
      }

      // Validate password length
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        setLoading(false)
        return
      }

      const result = studentRegister(name, email, password)

      if (result.success) {
        setSuccessMessage("¡Cuenta de estudiante creada exitosamente! Redirigiendo al pago...")
        setTimeout(() => {
          const refCode = localStorage.getItem("referral_code")
          const refParam = refCode ? `&ref=${refCode}` : ""
          router.push(`/pago?plan=estudiantes${refParam}`)
        }, 1500)
      } else {
        setError(result.error || "Error al registrar estudiante")
        setLoading(false)
      }
    } else {
      const user = studentLogin(email, password)

      if (user) {
        const refCode = localStorage.getItem("referral_code")
        const refParam = refCode ? `&ref=${refCode}` : ""
        router.push(`/pago?plan=estudiantes${refParam}`)
      } else {
        setError("Correo o contraseña incorrectos, o el correo no es institucional")
        setLoading(false)
      }
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setError("")
    setSuccessMessage("")
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-blue-600">Portal Estudiantes</CardTitle>
            <CardDescription className="mt-2 text-base">
              {isRegister ? "Crear cuenta de estudiante" : "Acceso exclusivo para estudiantes"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-blue-500 bg-blue-50">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <strong>Requisito:</strong> Debes usar tu correo institucional (.edu, .edu.do, etc.) para acceder al plan
              gratuito de estudiantes.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {successMessage}
              </div>
            )}
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ingrese su nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Institucional
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="estudiante@universidad.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Debe terminar en .edu, .edu.do, .edu.mx, etc.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme su contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 font-medium text-white hover:from-blue-600 hover:to-blue-700"
              disabled={loading}
            >
              {loading
                ? isRegister
                  ? "Creando cuenta..."
                  : "Iniciando sesión..."
                : isRegister
                  ? "Crear Cuenta de Estudiante"
                  : "Iniciar Sesión"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" onClick={toggleMode} className="text-sm font-medium text-blue-600 hover:underline">
              {isRegister ? "¿Ya tienes una cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
            </button>
          </div>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push("/planes")}
              className="text-sm text-gray-600 hover:underline"
            >
              ← Volver a planes
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
