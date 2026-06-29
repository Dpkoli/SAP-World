"use client";

import { Factory, GraduationCap, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { LearnerProfile } from "@/data/auth";
import { SapWorld } from "@/components/sap-world";

type AuthMode = "login" | "register" | "recover";

export function AuthGate() {
  const [user, setUser] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { user: LearnerProfile | null }) => {
        if (!cancelled) setUser(result.user);
      })
      .catch(() => {
        if (!cancelled) setError("The account service is temporarily unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      if (mode === "recover") {
        const response = await fetch("/api/auth/password-recovery/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: payload.email }),
        });
        const result = (await response.json()) as {
          message?: string;
          developmentToken?: string | null;
          error?: string;
        };
        if (!response.ok) {
          setError(result.error ?? "Unable to request password recovery.");
          return;
        }
        if (result.developmentToken) {
          window.location.assign(
            `/reset-password/${encodeURIComponent(result.developmentToken)}`,
          );
          return;
        }
        setMessage(
          result.message ??
            "If the account is active, recovery instructions are on their way.",
        );
        return;
      }
      const response = await fetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as {
        user?: LearnerProfile;
        error?: string;
      };
      if (!response.ok || !result.user) {
        setError(result.error ?? "Unable to access your account.");
        return;
      }
      setUser(result.user);
    } catch {
      setError("The account service is temporarily unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    setMode("login");
  }

  if (loading) {
    return (
      <main className="auth-shell">
        <div className="auth-loading">
          <Factory size={28} />
          <strong>Opening SAP World</strong>
          <span>Connecting your learning workspace...</span>
        </div>
      </main>
    );
  }

  if (user) {
    return <SapWorld user={user} onSignOut={signOut} />;
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="brand auth-brand">
          <span className="brand-mark"><Factory size={22} /></span>
          <div><strong>SAP World</strong><span>Enterprise Simulation Cloud</span></div>
        </div>
        <div className="auth-copy">
          <span className="auth-kicker">Learn inside a living enterprise</span>
          <h1>Master SAP by running the business.</h1>
          <p>
            Follow connected transactions, understand why each step exists,
            and see the operational and financial impact across SAP modules.
          </p>
          <div className="auth-benefits">
            <span><GraduationCap size={18} /> Guided S/4HANA transaction practice</span>
            <span><Factory size={18} /> Realistic end-to-end enterprise operations</span>
            <span><LockKeyhole size={18} /> Your progress follows your account</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <span className="auth-icon"><LockKeyhole size={22} /></span>
          <div>
            <span className="section-kicker">Learner workspace</span>
            <h2>
              {mode === "login"
                ? "Welcome back"
                : mode === "register"
                  ? "Create your account"
                  : "Recover your password"}
            </h2>
            <p>
              {mode === "login"
                ? "Continue your SAP learning journey."
                : mode === "register"
                  ? "Start with a private, progress-tracked workspace."
                  : "Request a secure, one-time recovery link."}
            </p>
          </div>

          {mode === "register" && (
            <label>
              Full name
              <input name="name" autoComplete="name" required minLength={2} placeholder="Deepa Koli" />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
          </label>
          {mode !== "recover" && (
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={mode === "register" ? 10 : 1}
                placeholder={mode === "register" ? "10+ characters, letter and number" : "Your password"}
              />
            </label>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="primary-button auth-submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : mode === "register"
                  ? "Create learner account"
                  : "Request recovery link"}
          </button>
          {mode === "login" && (
            <button
              className="auth-mode"
              type="button"
              onClick={() => {
                setMode("recover");
                setError("");
                setMessage("");
              }}
            >
              Forgot your password?
            </button>
          )}
          <button
            className="auth-mode"
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setMessage("");
            }}
          >
            {mode === "login"
              ? "New to SAP World? Create an account"
              : mode === "register"
                ? "Already have an account? Sign in"
                : "Return to sign in"}
          </button>
          <small>
            Local development accounts are stored only on this machine.
          </small>
          <div className="auth-admin-note">
            <ShieldCheck size={15} />
            <div>
              <strong>Admin development login</strong>
              <span>
                Administrator roles and account lifecycle controls are managed
                from the Control Plane. Environment emails are used only for
                the first owner bootstrap.
              </span>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
