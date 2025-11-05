export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          sku: string | null
          price: number
          cost: number
          stock_quantity: number
          unit: string | null
          category: string | null
          is_service: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          sku?: string | null
          price: number
          cost: number
          stock_quantity?: number
          unit?: string | null
          category?: string | null
          is_service?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          sku?: string | null
          price?: number
          cost?: number
          stock_quantity?: number
          unit?: string | null
          category?: string | null
          is_service?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          vendor_type: string | null
          contact_person: string | null
          payment_terms: number | null
          credit_limit: number | null
          status: string
          created_at: string
          updated_at: string
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string
          employee_code: string
          cedula: string
          nss: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          department_id: string | null
          position: string | null
          salary: number | null
          hire_date: string | null
          termination_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
      }
      referrals: {
        Row: {
          id: string
          user_id: string
          referral_code: string
          total_commissions: number
          total_referrals: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          referral_code: string
          total_commissions?: number
          total_referrals?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          referral_code?: string
          total_commissions?: number
          total_referrals?: number
          created_at?: string
          updated_at?: string
        }
      }
      referral_commissions: {
        Row: {
          id: string
          referral_id: string
          referred_user_id: string
          plan_purchased: string
          commission_amount: number
          status: string
          purchase_date: string
          created_at: string
        }
        Insert: {
          id?: string
          referral_id: string
          referred_user_id: string
          plan_purchased: string
          commission_amount: number
          status?: string
          purchase_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          referral_id?: string
          referred_user_id?: string
          plan_purchased?: string
          commission_amount?: number
          status?: string
          purchase_date?: string
          created_at?: string
        }
      }
    }
  }
}
