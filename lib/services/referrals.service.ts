import { createClient } from "@/lib/supabase/client"

const PLACEHOLDER_EMPRESA_ID = "00000000-0000-0000-0000-000000000000"

export interface Referral {
  id: string
  empresa_id: string
  usuario_id: string
  referral_code: string
  total_commissions: number
  pending_commissions: number
  paid_commissions: number
  total_referrals: number
  activo: boolean
  created_at: Date
  updated_at: Date
}

export interface ReferralCommission {
  id: string
  referral_id: string
  referred_user_name: string
  referred_user_email?: string
  plan_purchased: string
  commission_amount: number
  status: string
  purchase_date: Date
  payment_date?: Date
  notas?: string
  created_at: Date
}

export async function getReferrals(empresaId: string): Promise<Referral[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAllReferrals(): Promise<Referral[]> {
  return getReferrals(PLACEHOLDER_EMPRESA_ID)
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("referrals").select("*").eq("referral_code", code).single()

  if (error) return null
  return data
}

export async function createReferral(empresaId: string, usuarioId: string, code: string): Promise<Referral> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      empresa_id: empresaId,
      usuario_id: usuarioId,
      referral_code: code,
      total_commissions: 0,
      pending_commissions: 0,
      paid_commissions: 0,
      total_referrals: 0,
      activo: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getReferralCommissions(referralId: string): Promise<ReferralCommission[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("referral_commissions")
    .select("*")
    .eq("referral_id", referralId)
    .order("purchase_date", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createReferralCommission(
  referralId: string,
  commission: Omit<ReferralCommission, "id" | "referral_id" | "created_at">,
): Promise<ReferralCommission> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("referral_commissions")
    .insert({ ...commission, referral_id: referralId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCommissionStatus(commissionId: string, status: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("referral_commissions")
    .update({ status, payment_date: status === "paid" ? new Date().toISOString() : null })
    .eq("id", commissionId)

  if (error) throw error
}

export async function generateReferralCode(nombre: string): string {
  const base = nombre.replace(/\s+/g, "").toUpperCase().slice(0, 6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${base}${random}`
}
