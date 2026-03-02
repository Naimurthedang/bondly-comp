import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      signUp: vi.fn(() => Promise.resolve({ error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ error: null })),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: "tos-v1" } })),
        })),
      })),
    })),
  },
}));

vi.mock("@/integrations/lovable/index", () => ({
  lovable: {
    auth: {
      signInWithOAuth: vi.fn(() => Promise.resolve({ error: null, redirected: true })),
    },
  },
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe("Login Page", () => {
  it("renders login form with email and password fields", async () => {
    const Login = (await import("@/pages/Login")).default;
    render(<Login />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    console.log("[TEST:PASS] Login form renders with all fields");
  });

  it("renders Google OAuth button", async () => {
    const Login = (await import("@/pages/Login")).default;
    render(<Login />, { wrapper: Wrapper });
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    console.log("[TEST:PASS] Google OAuth button present on login");
  });

  it("shows forgot password mode toggle", async () => {
    const Login = (await import("@/pages/Login")).default;
    render(<Login />, { wrapper: Wrapper });
    const forgotBtn = screen.getByText("Forgot password?");
    fireEvent.click(forgotBtn);
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    console.log("[TEST:PASS] Password reset mode toggles correctly");
  });
});

describe("Signup Page", () => {
  it("renders signup form with name, email, password, and ToS checkbox", async () => {
    const Signup = (await import("@/pages/Signup")).default;
    render(<Signup />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min 6 characters")).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/)).toBeInTheDocument();
    console.log("[TEST:PASS] Signup form renders with ToS checkbox");
  });

  it("submit button is disabled until ToS is accepted", async () => {
    const Signup = (await import("@/pages/Signup")).default;
    render(<Signup />, { wrapper: Wrapper });
    const submitBtn = screen.getByText("Create Account").closest("button");
    expect(submitBtn).toBeDisabled();
    console.log("[TEST:PASS] Create Account button disabled without ToS acceptance");
  });

  it("renders Google OAuth button on signup", async () => {
    const Signup = (await import("@/pages/Signup")).default;
    render(<Signup />, { wrapper: Wrapper });
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    console.log("[TEST:PASS] Google OAuth button present on signup");
  });
});

describe("Google OAuth Integration", () => {
  it("calls lovable.auth.signInWithOAuth when Google button clicked on login", async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    const Login = (await import("@/pages/Login")).default;
    render(<Login />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText("Continue with Google"));
    await waitFor(() => {
      expect(lovable.auth.signInWithOAuth).toHaveBeenCalledWith("google", {
        redirect_uri: expect.any(String),
      });
    });
    console.log("[TEST:PASS] Google OAuth invoked via Lovable Cloud managed auth");
  });
});
