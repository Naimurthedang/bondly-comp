
-- ============================================
-- CHILD SAFETY MONITORING SCHEMA
-- ============================================

-- Verification status for caregivers (extended tracking)
CREATE TABLE public.caregiver_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID NOT NULL,
  verification_type TEXT NOT NULL, -- 'government_id', 'background_check', 'facial_match', 'criminal_record'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'expired'
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  document_url TEXT,
  notes TEXT,
  verified_by UUID,
  fraud_flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session check-ins (GPS tracking, geo-fencing)
CREATE TABLE public.session_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL,
  check_type TEXT NOT NULL, -- 'check_in', 'check_out', 'periodic', 'geo_fence_exit', 'geo_fence_enter'
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  is_within_geofence BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Geo-fence zones for sessions
CREATE TABLE public.geofence_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Home',
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 200,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Safety incidents & alerts
CREATE TABLE public.safety_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  reported_by UUID NOT NULL,
  incident_type TEXT NOT NULL, -- 'panic_button', 'distress_keyword', 'geo_fence_breach', 'missed_checkin', 'abnormal_termination', 'early_exit', 'manual_report'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'escalated', 'false_alarm'
  description TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  parent_notified_at TIMESTAMP WITH TIME ZONE,
  emergency_contact_notified_at TIMESTAMP WITH TIME ZONE,
  admin_escalated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Child wellbeing reports (post-session)
CREATE TABLE public.wellbeing_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL,
  child_id UUID REFERENCES public.babies(id),
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  care_notes TEXT,
  meals_log JSONB DEFAULT '[]'::jsonb,
  sleep_log JSONB DEFAULT '{}'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  incidents TEXT,
  overall_summary TEXT,
  ai_generated_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency contacts for parents
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  notify_on_incidents BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.caregiver_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellbeing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS: caregiver_verifications
CREATE POLICY "Caregivers can view own verifications" ON public.caregiver_verifications
  FOR SELECT USING (auth.uid() = caregiver_id);
CREATE POLICY "Admins can manage verifications" ON public.caregiver_verifications
  FOR ALL USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

-- RLS: session_checkins
CREATE POLICY "Booking participants can view checkins" ON public.session_checkins
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = session_checkins.booking_id
    AND (bookings.parent_id = auth.uid() OR bookings.caregiver_id = auth.uid())
  ));
CREATE POLICY "Caregivers can insert checkins" ON public.session_checkins
  FOR INSERT WITH CHECK (auth.uid() = caregiver_id AND EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = session_checkins.booking_id
    AND bookings.caregiver_id = auth.uid()
  ));

-- RLS: geofence_zones
CREATE POLICY "Parents can manage own geofences" ON public.geofence_zones
  FOR ALL USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

-- RLS: safety_incidents
CREATE POLICY "Booking participants can view incidents" ON public.safety_incidents
  FOR SELECT USING (
    auth.uid() = reported_by OR EXISTS (
      SELECT 1 FROM bookings WHERE bookings.id = safety_incidents.booking_id
      AND (bookings.parent_id = auth.uid() OR bookings.caregiver_id = auth.uid())
    )
  );
CREATE POLICY "Users can report incidents" ON public.safety_incidents
  FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Admins can manage all incidents" ON public.safety_incidents
  FOR ALL USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

-- RLS: wellbeing_reports
CREATE POLICY "Booking participants can view reports" ON public.wellbeing_reports
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = wellbeing_reports.booking_id
    AND (bookings.parent_id = auth.uid() OR bookings.caregiver_id = auth.uid())
  ));
CREATE POLICY "Caregivers can create reports" ON public.wellbeing_reports
  FOR INSERT WITH CHECK (auth.uid() = caregiver_id AND EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = wellbeing_reports.booking_id
    AND bookings.caregiver_id = auth.uid()
  ));

-- RLS: emergency_contacts
CREATE POLICY "Parents can manage own contacts" ON public.emergency_contacts
  FOR ALL USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

-- Triggers for updated_at
CREATE TRIGGER update_caregiver_verifications_updated_at BEFORE UPDATE ON public.caregiver_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_geofence_zones_updated_at BEFORE UPDATE ON public.geofence_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_safety_incidents_updated_at BEFORE UPDATE ON public.safety_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indices for performance
CREATE INDEX idx_session_checkins_booking ON public.session_checkins(booking_id);
CREATE INDEX idx_safety_incidents_booking ON public.safety_incidents(booking_id);
CREATE INDEX idx_safety_incidents_status ON public.safety_incidents(status);
CREATE INDEX idx_safety_incidents_severity ON public.safety_incidents(severity);
CREATE INDEX idx_wellbeing_reports_booking ON public.wellbeing_reports(booking_id);
CREATE INDEX idx_caregiver_verifications_caregiver ON public.caregiver_verifications(caregiver_id);
CREATE INDEX idx_emergency_contacts_parent ON public.emergency_contacts(parent_id);

-- Enable realtime for safety incidents
ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_checkins;
