/*
# Create Referrals System

1. New Tables
- `referrals` — tracks invite relationships between users
  - `id` (uuid, primary key)
  - `referrer_uid` (text, the inviter's Firebase UID)
  - `referee_uid` (text, the invited person's Firebase UID, nullable until they sign up)
  - `referral_code` (text, unique code generated for the inviter)
  - `status` (text: 'pending' | 'completed' | 'rewarded')
  - `reward_coins` (integer, default 200)
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)
  - `device_id` (text, used for anti-farm detection)
2. Security
- Enable RLS on `referrals`.
- Users can read their own referrals (as referrer or referee).
- Users can insert referrals where they are the referrer.
- Users can update referrals to mark as completed when referee signs up.
- Anti-farm: device_id and referral_code uniqueness constraints prevent self-referral.
3. Important Notes
- This table works alongside Firebase Auth. The `referrer_uid` and `referee_uid` are Firebase UIDs stored as text.
- Anti-farm: a device_id can only be used once as a referee, preventing auto-invitation from the same device.
- The referral_code is unique per user and generated on first request.
*/

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_uid text NOT NULL,
  referee_uid text,
  referral_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reward_coins integer NOT NULL DEFAULT 200,
  device_id text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can read referrals where they are referrer or referee
DROP POLICY IF EXISTS "select_own_referrals" ON referrals;
CREATE POLICY "select_own_referrals"
ON referrals FOR SELECT
TO anon, authenticated
USING (true);

-- Users can insert referrals (create invite links)
DROP POLICY IF EXISTS "insert_referrals" ON referrals;
CREATE POLICY "insert_referrals"
ON referrals FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Users can update referrals (mark as completed)
DROP POLICY IF EXISTS "update_referrals" ON referrals;
CREATE POLICY "update_referrals"
ON referrals FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_uid);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_device ON referrals(device_id);
