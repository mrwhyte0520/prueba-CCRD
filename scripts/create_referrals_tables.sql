-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  total_commissions DECIMAL(10, 2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_commissions table
CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  referred_user_id TEXT NOT NULL,
  plan_purchased TEXT NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, withdrawn
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_commissions_referral_id ON referral_commissions(referral_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON referral_commissions(status);

-- Create function to update referral stats
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE referrals
  SET 
    total_commissions = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM referral_commissions
      WHERE referral_id = NEW.referral_id
    ),
    total_referrals = (
      SELECT COUNT(*)
      FROM referral_commissions
      WHERE referral_id = NEW.referral_id
    ),
    updated_at = NOW()
  WHERE id = NEW.referral_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update referral stats
DROP TRIGGER IF EXISTS trigger_update_referral_stats ON referral_commissions;
CREATE TRIGGER trigger_update_referral_stats
AFTER INSERT OR UPDATE ON referral_commissions
FOR EACH ROW
EXECUTE FUNCTION update_referral_stats();
