

# Bondly Platform Expansion Plan

## Phase 1: Fix Security Warnings (3 findings)

### 1. Leaked Password Protection
- Enable leaked password protection via the auth configuration tool

### 2. Stories table -- missing UPDATE policy
- Add RLS policy: users can update stories belonging to their own babies (via baby_id ownership check)

### 3. Parenting Guides -- missing UPDATE and DELETE policies
- Add UPDATE and DELETE RLS policies using the same baby_id ownership pattern

---

## Phase 2: Database Schema for Marketplace

Create new tables to support the caregiver marketplace, messaging, investor forms, and ratings:

### New Tables

**caregiver_profiles** -- stores caregiver-specific data
- user_id, full_name, bio, hourly_rate, years_experience, education, certifications (JSONB), specialties (JSONB), languages (JSONB), location_radius, availability (JSONB), verification_status (enum: pending/verified/rejected), profile_completeness (integer), created_at, updated_at

**bookings** -- hiring pipeline
- id, parent_id, caregiver_id, status (enum: requested/accepted/in_progress/completed/cancelled/disputed), start_time, end_time, hourly_rate, total_amount, notes, address_revealed (boolean), created_at, updated_at

**reviews** -- ratings and feedback
- id, booking_id, reviewer_id, reviewee_id, overall_rating (1-5), safety_rating, kindness_rating, punctuality_rating, comment, is_verified_hire, created_at

**messages** -- real-time chat (using Supabase Realtime)
- id, booking_id, sender_id, content, message_type (text/image/system), read_at, created_at

**investor_inquiries** -- investment form submissions
- id, investor_name, firm, investment_range, email, phone, message, nda_requested, created_at

### RLS Policies
- All tables secured with ownership-based RLS
- Caregivers can only edit their own profiles
- Parents and caregivers can only see messages/bookings they are part of
- Reviews only writable by booking participants after completion
- Investor inquiries: insert-only for public, select for admins

### Realtime
- Enable Supabase Realtime on the `messages` table for live chat

---

## Phase 3: New Pages and Components

### New Routes
- `/marketplace` -- Browse and search caregivers
- `/caregiver/:id` -- Caregiver profile detail
- `/bookings` -- Manage active and past bookings
- `/messages` -- Chat interface for active bookings
- `/invest` -- Investor landing page with form
- `/about` -- Company about/trust page
- `/caregiver/onboarding` -- Caregiver registration flow

### Marketplace Components
- **CaregiverCard** -- search result card with photo, rate, rating, specialties
- **CaregiverSearch** -- filters for specialty, price range, availability, rating
- **CaregiverProfile** -- full detail view with reviews, availability calendar
- **BookingFlow** -- multi-step: select time, confirm details, submit request
- **BookingCard** -- status tracker for each booking stage
- **ReviewForm** -- star ratings with skill-specific categories and comment

### Messaging Components
- **ChatWindow** -- real-time message list using Supabase Realtime subscriptions
- **MessageBubble** -- styled message with timestamps and read receipts
- **ConversationList** -- sidebar listing active booking conversations

### Investor/About Pages
- **InvestorHero** -- vision, market opportunity, growth metrics sections
- **InvestmentForm** -- validated form with name, firm, range, NDA toggle, stored in database
- **AboutPage** -- company story, safety standards, team profiles, testimonials

### Dashboard Updates
- Add "Marketplace", "Bookings", and "Messages" to the sidebar navigation
- Add caregiver mode toggle for users who register as caregivers

---

## Phase 4: Edge Functions

### chatbot-proxy (already exists)
- No changes needed

### send-notification
- Edge function to send email notifications for booking status changes and new messages
- Uses Lovable AI for generating notification content

---

## Important Scope Limitations

The following items from the request require infrastructure beyond what this platform supports and are excluded from this plan:

- **Escrow/PCI-compliant payments**: Requires Stripe integration (can be added separately via the Stripe connector)
- **WebSocket server / Socket.IO**: Using Supabase Realtime instead (Postgres-based, works well for this scale)
- **Microservices / auto-scaling containers**: The platform runs on a single Vite + Supabase stack
- **Geo-fencing, map integration, travel ETA**: Requires third-party mapping APIs (e.g., Google Maps) which can be added later
- **End-to-end encryption**: Not feasible with Supabase Realtime; messages are encrypted at rest
- **AI fraud detection, fake review detection**: Would require ML infrastructure; using manual admin moderation instead
- **Video calls**: Requires WebRTC infrastructure (e.g., Twilio, Daily.co) -- can be added as a future integration
- **Multi-currency, tax reports, invoice generation**: Requires Stripe or similar payment processor
- **Redis caching, message queue buffering**: Using React Query client-side caching and Supabase Realtime instead
- **DevOps pipeline, observability dashboards**: Outside platform scope

---

## Technical Details

### File Structure (new files)
```text
src/pages/
  Marketplace.tsx
  CaregiverDetail.tsx
  Bookings.tsx
  Messages.tsx
  Invest.tsx
  About.tsx
  CaregiverOnboarding.tsx

src/components/marketplace/
  CaregiverCard.tsx
  CaregiverSearch.tsx
  CaregiverProfile.tsx
  BookingFlow.tsx
  BookingCard.tsx
  ReviewForm.tsx

src/components/messaging/
  ChatWindow.tsx
  MessageBubble.tsx
  ConversationList.tsx

src/components/investor/
  InvestorHero.tsx
  InvestmentForm.tsx

src/components/about/
  AboutPage.tsx
  TeamSection.tsx

supabase/functions/send-notification/index.ts
```

### Database Enums
- `verification_status`: pending, verified, rejected
- `booking_status`: requested, accepted, in_progress, completed, cancelled, disputed
- `message_type`: text, image, system

### Implementation Order
1. Database migration (all tables, enums, RLS, realtime)
2. Security fixes (3 warn items)
3. Marketplace pages (search, profiles, booking flow)
4. Messaging system (Supabase Realtime)
5. Investor and About pages
6. Dashboard navigation updates
7. Send-notification edge function

