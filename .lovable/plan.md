

# 🍼 Bondly — AI Parenting Web App Foundation

A stunning, hackathon-ready SaaS foundation with working auth, scalable database, and a landing page that looks like a funded startup.

---

## 1. Landing Page — Premium & Playful

A single-page marketing site with Framer Motion scroll animations, pastel color palette (sky blue, lavender, soft yellow), glassmorphism cards, and rounded typography.

**Sections:**
- **Navbar** — Logo, Features, Pricing links, Login/Signup CTA buttons (sticky, glassmorphism blur)
- **Hero** — Bold headline, subtext, dual CTA buttons, animated gradient background with floating illustration placeholder
- **Features Grid** — 6 glassmorphism cards: AI Bedtime Songs, AI Storybooks, Learning Puzzles, Parenting Guide, Rhymes Videos, Growth Tracking (with icons and hover effects)
- **Demo Showcase** — Mock previews of a storybook page, audio player UI, and puzzle game UI
- **Testimonials** — Parent avatars with review cards in a carousel/grid
- **Pricing** — Free / Pro / Family tier cards with feature comparison
- **CTA Banner** — Final call-to-action with gradient background
- **Footer** — Navigation links, social icons, copyright

All sections animate in on scroll using Framer Motion (fade-up, stagger, scale).

---

## 2. Authentication System (Supabase Auth)

Full email/password authentication with Google OAuth.

**Pages:**
- `/login` — Email + password form, Google OAuth button, "Forgot password" link
- `/signup` — Registration form with validation, Google OAuth button
- `/dashboard` — Protected route (redirects to login if not authenticated)

**Features:**
- Form validation with error messages
- Loading states on submit
- Forgot password flow (email reset)
- Email verification
- Auth state management with protected route wrapper
- User profiles table auto-created on signup via database trigger

---

## 3. Database Schema (Supabase + Lovable Cloud)

Scalable schema designed for future AI feature integration:

- **profiles** — id, email, full_name, avatar_url, created_at (auto-created on signup)
- **babies** — id, user_id (FK), name, birth_date, gender, preferences (JSONB)
- **songs** — id, baby_id (FK), title, audio_url, created_at
- **stories** — id, baby_id (FK), title, pdf_url, cover_image, created_at
- **learning_sessions** — id, baby_id (FK), topic, score, created_at
- **parenting_guides** — id, baby_id (FK), guide_text, created_at
- **user_roles** — id, user_id (FK), role (enum: admin, user)

All tables with Row-Level Security so users can only access their own data.

---

## 4. Dashboard (Basic)

After login, users see a clean dashboard with:

- Welcome header with user name
- Baby profile card(s) or empty state with "Add Baby" button
- Placeholder cards for future AI features (Songs, Stories, Learning, Guides)
- Clean sidebar or top navigation

---

## 5. Onboarding Flow (Multi-step)

A 4-step onboarding wizard shown after first signup:

1. **Add Baby Info** — Name, birth date, gender
2. **Parenting Goals** — Select from options (bonding, learning, sleep, etc.)
3. **Learning Style** — Visual, auditory, kinesthetic preferences
4. **Sleep Schedule** — Bedtime, wake time, nap preferences

Progress bar at the top. Responses stored in the babies table (preferences JSONB column). Skippable but encouraged.

---

## 6. Design System

Custom Tailwind theme with:
- Pastel palette: sky blue, lavender, soft yellow, mint, blush pink
- Glassmorphism utility classes (backdrop blur + translucent backgrounds)
- Rounded, friendly typography (Inter or similar)
- Consistent spacing, shadows, and border-radius
- Dark mode support (optional, stretch goal)

