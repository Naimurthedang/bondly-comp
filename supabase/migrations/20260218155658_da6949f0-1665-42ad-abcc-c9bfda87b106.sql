
-- =============================================
-- SYSTEM 1: AI Recommendation Engine Support
-- =============================================

-- Parent preferences for matching
CREATE TABLE public.parent_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preferred_languages jsonb DEFAULT '["English"]'::jsonb,
  preferred_specialties jsonb DEFAULT '[]'::jsonb,
  max_hourly_rate numeric,
  min_experience_years integer DEFAULT 0,
  location_lat numeric,
  location_lng numeric,
  location_radius_km integer DEFAULT 15,
  schedule_preferences jsonb DEFAULT '{}'::jsonb,
  special_requirements text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.parent_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON public.parent_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recommendation logs for learning
CREATE TABLE public.recommendation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  caregiver_id uuid NOT NULL,
  compatibility_score numeric NOT NULL DEFAULT 0,
  match_reasons jsonb DEFAULT '[]'::jsonb,
  was_clicked boolean DEFAULT false,
  was_booked boolean DEFAULT false,
  was_successful boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON public.recommendation_logs
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "System can insert recommendations" ON public.recommendation_logs
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- =============================================
-- SYSTEM 2: Growth, Retention & LiveOps
-- =============================================

-- Referral system
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_email text NOT NULL,
  referred_user_id uuid,
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'rewarded')),
  reward_amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Engagement events tracking
CREATE TABLE public.engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON public.engagement_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can log events" ON public.engagement_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loyalty & rewards
CREATE TABLE public.loyalty_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  booking_streak integer DEFAULT 0,
  total_bookings integer DEFAULT 0,
  credits_balance numeric DEFAULT 0,
  badges jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON public.loyalty_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards" ON public.loyalty_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards" ON public.loyalty_rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- LiveOps campaigns
CREATE TABLE public.liveops_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  campaign_type text NOT NULL CHECK (campaign_type IN ('discount', 'boost', 'event', 'promotion')),
  discount_percent numeric DEFAULT 0,
  is_active boolean DEFAULT false,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  target_audience text DEFAULT 'all' CHECK (target_audience IN ('all', 'parents', 'caregivers', 'new_users', 'vip')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.liveops_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active campaigns" ON public.liveops_campaigns
  FOR SELECT USING (is_active = true AND now() BETWEEN starts_at AND ends_at);

CREATE POLICY "Admins can manage campaigns" ON public.liveops_campaigns
  FOR ALL USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_parent_preferences_updated_at BEFORE UPDATE ON public.parent_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loyalty_rewards_updated_at BEFORE UPDATE ON public.loyalty_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for engagement events
CREATE INDEX idx_engagement_events_user_type ON public.engagement_events(user_id, event_type);
CREATE INDEX idx_engagement_events_created ON public.engagement_events(created_at DESC);
CREATE INDEX idx_recommendation_logs_parent ON public.recommendation_logs(parent_id, created_at DESC);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
