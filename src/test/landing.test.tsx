import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: "tos-v1" } })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [] })),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
}));

vi.mock("@/integrations/lovable/index", () => ({
  lovable: {
    auth: {
      signInWithOAuth: vi.fn(() => Promise.resolve({ error: null, redirected: true })),
    },
  },
}));

describe("Landing Page - Hero", () => {
  it("renders hero section with CTA buttons", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    expect(screen.getByText("Start Free")).toBeInTheDocument();
    expect(screen.getByText("See Demo")).toBeInTheDocument();
    console.log("[TEST:PASS] Hero renders with CTA buttons");
  });

  it("See Demo links to /demo route", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    const demoLink = screen.getByText("See Demo").closest("a");
    expect(demoLink).toHaveAttribute("href", "/demo");
    console.log("[TEST:PASS] See Demo button links to /demo");
  });
});

describe("Landing Page - Features", () => {
  it("renders features section", async () => {
    const { Features } = await import("@/components/landing/Features");
    render(
      <MemoryRouter>
        <Features />
      </MemoryRouter>
    );
    expect(screen.getByText(/feature/i)).toBeInTheDocument();
    console.log("[TEST:PASS] Features section renders");
  });
});

describe("Landing Page - Testimonials", () => {
  it("renders testimonial cards", async () => {
    const { Testimonials } = await import("@/components/landing/Testimonials");
    render(
      <MemoryRouter>
        <Testimonials />
      </MemoryRouter>
    );
    expect(screen.getByText("Loved by families everywhere")).toBeInTheDocument();
    console.log("[TEST:PASS] Testimonials section renders");
  });
});

describe("Landing Page - Trust Badges", () => {
  it("renders trust badge section", async () => {
    const { TrustBadges } = await import("@/components/landing/TrustBadges");
    render(
      <MemoryRouter>
        <TrustBadges />
      </MemoryRouter>
    );
    expect(screen.getByText(/trust/i)).toBeInTheDocument();
    console.log("[TEST:PASS] Trust badges section renders");
  });
});

describe("Landing Page - Navbar", () => {
  it("renders navigation with Demo route link", async () => {
    const { Navbar } = await import("@/components/landing/Navbar");
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Bondly")).toBeInTheDocument();
    const demoLinks = screen.getAllByText("Demo");
    expect(demoLinks.length).toBeGreaterThan(0);
    console.log("[TEST:PASS] Navbar renders with Demo link");
  });
});
