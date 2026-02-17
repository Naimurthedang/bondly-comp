
-- Phase 1: Security fixes — missing RLS policies

-- Stories: missing UPDATE policy
CREATE POLICY "Users can update own stories"
ON public.stories
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM babies
  WHERE babies.id = stories.baby_id AND babies.user_id = auth.uid()
));

-- Parenting guides: missing UPDATE and DELETE policies
CREATE POLICY "Users can update own guides"
ON public.parenting_guides
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM babies
  WHERE babies.id = parenting_guides.baby_id AND babies.user_id = auth.uid()
));

CREATE POLICY "Users can delete own guides"
ON public.parenting_guides
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM babies
  WHERE babies.id = parenting_guides.baby_id AND babies.user_id = auth.uid()
));

-- Phase 2: Enums
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.booking_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'system');

-- Phase 2: caregiver_profiles
CREATE TABLE public.caregiver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  bio TEXT,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 25.00,
  years_experience INTEGER DEFAULT 0,
  education TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  specialties JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '["English"]'::jsonb,
  location_radius INTEGER DEFAULT 10,
  availability JSONB DEFAULT '{}'::jsonb,
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  profile_completeness INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.caregiver_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can browse verified caregivers
CREATE POLICY "Anyone can view verified caregivers"
ON public.caregiver_profiles FOR SELECT
USING (verification_status = 'verified' OR auth.uid() = user_id);

-- Caregivers can insert their own profile
CREATE POLICY "Users can insert own caregiver profile"
ON public.caregiver_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Caregivers can update their own profile
CREATE POLICY "Users can update own caregiver profile"
ON public.caregiver_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can update any profile (for verification)
CREATE POLICY "Admins can update any caregiver profile"
ON public.caregiver_profiles FOR UPDATE
USING (public.has_role('admin'));

CREATE TRIGGER update_caregiver_profiles_updated_at
BEFORE UPDATE ON public.caregiver_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 2: bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id),
  caregiver_id UUID NOT NULL REFERENCES auth.users(id),
  status public.booking_status NOT NULL DEFAULT 'requested',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  hourly_rate NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2),
  notes TEXT,
  address_revealed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = parent_id OR auth.uid() = caregiver_id);

CREATE POLICY "Parents can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Participants can update own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = parent_id OR auth.uid() = caregiver_id);

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 2: reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  reviewee_id UUID NOT NULL REFERENCES auth.users(id),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  kindness_rating INTEGER CHECK (kindness_rating >= 1 AND kindness_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  comment TEXT,
  is_verified_hire BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Booking participants can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = reviews.booking_id
    AND bookings.status = 'completed'
    AND (bookings.parent_id = auth.uid() OR bookings.caregiver_id = auth.uid())
  )
);

-- Phase 2: messages (with realtime)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  message_type public.message_type NOT NULL DEFAULT 'text',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants can view messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = messages.booking_id
    AND (bookings.parent_id = auth.uid() OR bookings.caregiver_id = auth.uid())
  )
);

CREATE POLICY "Booking participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = messages.booking_id
    AND (bookings.parent_id = auth.uid() OR bookings.caregiver_id = auth.uid())
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = messages.booking_id
    AND (bookings.parent_id = auth.uid() OR bookings.caregiver_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Phase 2: investor_inquiries
CREATE TABLE public.investor_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_name TEXT NOT NULL,
  firm TEXT,
  investment_range TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  nda_requested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an inquiry (no auth required)
CREATE POLICY "Anyone can submit investor inquiry"
ON public.investor_inquiries FOR INSERT
WITH CHECK (true);

-- Only admins can view inquiries
CREATE POLICY "Admins can view investor inquiries"
ON public.investor_inquiries FOR SELECT
USING (public.has_role('admin'));
