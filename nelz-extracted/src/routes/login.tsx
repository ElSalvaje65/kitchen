import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BrandMark, useBrand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const searchSchema = z.object({
  next: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const dest = next === "/admin" ? "/admin" : "/";
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const brand = useBrand();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isPending && user) {
    void navigate({ to: dest });
  }

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "Staff");
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({ email, password, name });
        if (res.error) throw new Error(res.error.message || "Sign up failed");
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message || "Sign in failed");
      }
      await navigate({ to: dest });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <BrandMark name={brand.shopName} logo={brand.logo} />
          <span className="font-medium">{brand.shopName}</span>
        </Link>
        <h1 className="font-display text-2xl">Staff access</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Kitchen seats are limited to two signed-in accounts. Everyone else can still order from the menu.
        </p>
        {authEnabled ? (
          <>
            <form onSubmit={onEmail} className="space-y-3">
              {mode === "up" ? (
                <label className="block text-sm font-medium">
                  Name
                  <input
                    name="name"
                    required
                    className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
                  />
                </label>
              ) : null}
              <label className="block text-sm font-medium">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
                />
              </label>
              <label className="block text-sm font-medium">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm"
                />
              </label>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button magnetic className="w-full" disabled={busy}>
                {busy ? "Please wait…" : mode === "up" ? "Create staff account" : "Sign in"}
              </Button>
            </form>
            <button
              type="button"
              className="mt-3 w-full text-center text-sm text-muted hover:text-fg"
              onClick={() => setMode(mode === "up" ? "in" : "up")}
            >
              {mode === "up" ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-subtle">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: dest })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
