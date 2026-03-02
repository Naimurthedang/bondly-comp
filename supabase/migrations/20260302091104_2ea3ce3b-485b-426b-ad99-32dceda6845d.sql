
-- ===========================
-- 1. ToS Versions & Acceptances
-- ===========================
CREATE TABLE public.tos_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'Terms of Service',
  content text NOT NULL,
  published_at timestamptz,
  is_current boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tos_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published ToS" ON public.tos_versions
  FOR SELECT USING (published_at IS NOT NULL);

CREATE POLICY "Admins can manage ToS" ON public.tos_versions
  FOR ALL USING (has_role('admin'::app_role))
  WITH CHECK (has_role('admin'::app_role));

CREATE TABLE public.tos_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tos_version_id uuid NOT NULL REFERENCES public.tos_versions(id),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address text
);

ALTER TABLE public.tos_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own acceptances" ON public.tos_acceptances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own acceptances" ON public.tos_acceptances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===========================
-- 2. Baby Content & Webhooks
-- ===========================
CREATE TABLE public.baby_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id uuid NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('video', 'photo', 'milestone')),
  title text,
  description text,
  file_url text,
  thumbnail_url text,
  privacy_level text NOT NULL DEFAULT 'private' CHECK (privacy_level IN ('private', 'friends', 'public')),
  ai_tags jsonb DEFAULT '[]'::jsonb,
  duration_seconds integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.baby_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own content" ON public.baby_content
  FOR ALL USING (auth.uid() = parent_id)
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Public content is viewable" ON public.baby_content
  FOR SELECT USING (privacy_level = 'public');

-- Video interactions for ranking algorithm
CREATE TABLE public.video_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.baby_content(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'like', 'comment', 'share')),
  watch_duration_seconds integer,
  watch_percentage numeric,
  comment_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own interactions" ON public.video_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own interactions" ON public.video_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Content owners can view interactions" ON public.video_interactions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM baby_content WHERE baby_content.id = video_interactions.content_id AND baby_content.parent_id = auth.uid()
  ));

-- Webhooks
CREATE TABLE public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  secret text NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks" ON public.webhooks
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  next_retry_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deliveries" ON public.webhook_deliveries
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM webhooks WHERE webhooks.id = webhook_deliveries.webhook_id AND webhooks.user_id = auth.uid()
  ));

-- Storage bucket for baby content
INSERT INTO storage.buckets (id, name, public) VALUES ('baby-content', 'baby-content', false);

CREATE POLICY "Users can upload own content" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'baby-content' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own content" ON storage.objects
  FOR SELECT USING (bucket_id = 'baby-content' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public content viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'baby-content' AND (storage.foldername(name))[2] = 'public');

-- Indexes
CREATE INDEX idx_baby_content_parent ON public.baby_content(parent_id);
CREATE INDEX idx_baby_content_privacy ON public.baby_content(privacy_level);
CREATE INDEX idx_video_interactions_content ON public.video_interactions(content_id);
CREATE INDEX idx_tos_acceptances_user ON public.tos_acceptances(user_id);
CREATE INDEX idx_webhook_deliveries_webhook ON public.webhook_deliveries(webhook_id);

-- Insert initial ToS version
INSERT INTO public.tos_versions (version, title, content, published_at, is_current) VALUES (
  '1.0',
  'Terms of Service',
  E'# Bondly Terms of Service\n\n**Effective Date: March 2, 2026**\n\n## 1. Acceptance of Terms\nBy creating an account or using Bondly, you agree to these Terms of Service.\n\n## 2. Privacy & Child Safety\nWe prioritize child safety above all. All content involving children is subject to strict privacy controls.\n\n## 3. User Responsibilities\n- You must be 18+ to use this platform\n- You are responsible for content you upload\n- You must not share inappropriate content involving minors\n\n## 4. Content Ownership\nYou retain ownership of all content you upload. By uploading, you grant Bondly a limited license to display and process your content.\n\n## 5. Caregiver Verification\nAll caregivers must complete verification. Bondly is not liable for interactions outside the platform.\n\n## 6. Termination\nWe may suspend accounts that violate these terms.\n\n## 7. Changes to Terms\nWe will notify you of material changes and require re-acceptance.',
  now(),
  true
);
