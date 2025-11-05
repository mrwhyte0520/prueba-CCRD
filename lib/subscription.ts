// Sistema de suscripción SaaS
export type PlanType = "basico" | "intermedio" | "pro" | "estudiantes"

export interface Plan {
  id: PlanType
  name: string
  price: number
  features: string[]
  limits: {
    productos: number
    clientes: number
    facturas: number
    empleados: number
    suplidores: number
    facturasPerDay?: number // Added daily invoice limit
  }
  hasImpuestos: boolean
  hasAdvancedDashboard: boolean
  requiresInstitutionalEmail?: boolean
}

export const plans: Record<PlanType, Plan> = {
  basico: {
    id: "basico",
    name: "Básico",
    price: 0,
    features: [
      "Dashboard básico",
      "Punto de venta limitado",
      "Máximo 5 productos",
      "Máximo 5 clientes",
      "Máximo 3 facturas nuevas por día",
      "Máximo 2 empleados",
      "Máximo 3 suplidores",
      "Sin módulo de impuestos",
    ],
    limits: {
      productos: 5,
      clientes: 5,
      facturas: 15,
      empleados: 2,
      suplidores: 3,
      facturasPerDay: 3,
    },
    hasImpuestos: false,
    hasAdvancedDashboard: false,
  },
  estudiantes: {
    id: "estudiantes",
    name: "Estudiantes",
    price: 29,
    features: [
      "Plan especial para estudiantes",
      "Dashboard avanzado con KPIs",
      "Punto de venta ilimitado",
      "Inventario ilimitado",
      "Clientes y suplidores ilimitados",
      "Contabilidad completa",
      "Módulo de impuestos completo",
      "Sin límites de registros",
      "Requiere correo institucional",
    ],
    limits: {
      productos: Number.POSITIVE_INFINITY,
      clientes: Number.POSITIVE_INFINITY,
      facturas: Number.POSITIVE_INFINITY,
      empleados: Number.POSITIVE_INFINITY,
      suplidores: Number.POSITIVE_INFINITY,
    },
    hasImpuestos: true,
    hasAdvancedDashboard: true,
    requiresInstitutionalEmail: true,
  },
  intermedio: {
    id: "intermedio",
    name: "Intermedio",
    price: 49,
    features: [
      "Dashboard básico",
      "Punto de venta",
      "Inventario limitado",
      "Clientes y suplidores",
      "Contabilidad completa",
      "Módulo de impuestos completo",
      "Límite de 15 registros por módulo",
    ],
    limits: {
      productos: 15,
      clientes: 15,
      facturas: 15,
      empleados: 15,
      suplidores: 15,
    },
    hasImpuestos: true,
    hasAdvancedDashboard: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 99,
    features: [
      "Dashboard avanzado con KPIs",
      "Punto de venta ilimitado",
      "Inventario ilimitado",
      "Clientes y suplidores ilimitados",
      "Contabilidad completa",
      "Módulo de impuestos completo",
      "Sin límites de registros",
      "Soporte prioritario",
    ],
    limits: {
      productos: Number.POSITIVE_INFINITY,
      clientes: Number.POSITIVE_INFINITY,
      facturas: Number.POSITIVE_INFINITY,
      empleados: Number.POSITIVE_INFINITY,
      suplidores: Number.POSITIVE_INFINITY,
    },
    hasImpuestos: true,
    hasAdvancedDashboard: true,
  },
}

export function getCurrentPlan(): PlanType {
  if (typeof window === "undefined") return "basico"
  const plan = localStorage.getItem("subscription_plan")
  return (plan as PlanType) || "basico"
}

export function setCurrentPlan(plan: PlanType) {
  localStorage.setItem("subscription_plan", plan)
}

export function getPlanLimits(): Plan["limits"] {
  const currentPlan = getCurrentPlan()
  return plans[currentPlan].limits
}

export function canAddMore(module: keyof Plan["limits"], currentCount: number): boolean {
  const limits = getPlanLimits()
  return currentCount < limits[module]
}

export async function checkSubscriptionLimit(
  module: "products" | "customers" | "vendors" | "employees" | "invoices",
  currentCount: number,
): Promise<boolean> {
  const currentPlan = getCurrentPlan()
  const plan = plans[currentPlan]

  const moduleMap: Record<string, keyof Plan["limits"]> = {
    products: "productos",
    customers: "clientes",
    vendors: "suplidores",
    employees: "empleados",
    invoices: "facturas",
  }

  const limitKey = moduleMap[module]
  const limit = plan.limits[limitKey]

  return currentCount < limit
}

export function canCreateInvoiceToday(): boolean {
  const currentPlan = getCurrentPlan()
  const plan = plans[currentPlan]

  // If no daily limit, allow unlimited
  if (!plan.limits.facturasPerDay) {
    return true
  }

  // Get today's date as string (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0]
  const storageKey = `invoices_created_${today}`

  // Get count of invoices created today
  const invoicesToday = Number.parseInt(localStorage.getItem(storageKey) || "0")

  return invoicesToday < plan.limits.facturasPerDay
}

export function incrementDailyInvoiceCount(): void {
  const today = new Date().toISOString().split("T")[0]
  const storageKey = `invoices_created_${today}`
  const currentCount = Number.parseInt(localStorage.getItem(storageKey) || "0")
  localStorage.setItem(storageKey, (currentCount + 1).toString())
}

export function getRemainingDailyInvoices(): number | null {
  const currentPlan = getCurrentPlan()
  const plan = plans[currentPlan]

  // If no daily limit, return null (unlimited)
  if (!plan.limits.facturasPerDay) {
    return null
  }

  const today = new Date().toISOString().split("T")[0]
  const storageKey = `invoices_created_${today}`
  const invoicesToday = Number.parseInt(localStorage.getItem(storageKey) || "0")

  return Math.max(0, plan.limits.facturasPerDay - invoicesToday)
}

export function hasImpuestosAccess(): boolean {
  const currentPlan = getCurrentPlan()
  return plans[currentPlan].hasImpuestos
}

export function hasAdvancedDashboard(): boolean {
  const currentPlan = getCurrentPlan()
  return plans[currentPlan].hasAdvancedDashboard
}

export function requiresInstitutionalEmail(): boolean {
  const currentPlan = getCurrentPlan()
  return plans[currentPlan].requiresInstitutionalEmail || false
}

export function hasPaidPlan(): boolean {
  const currentPlan = getCurrentPlan()
  return currentPlan !== "basico"
}

export function cancelSubscription(): void {
  setCurrentPlan("basico")
  // Clear any payment-related data
  localStorage.removeItem("payment_date")
  localStorage.removeItem("subscription_end_date")
}

export function getCurrentPlanName(): string {
  const currentPlan = getCurrentPlan()
  return plans[currentPlan].name
}
