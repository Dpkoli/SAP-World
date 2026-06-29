"use client";

import { Factory, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function PasswordResetForm({ token }: { token: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setError("The password confirmation does not match.");
      setSubmitting(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/password-recovery/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        setError(result.error ?? "Unable to update the password.");
        return;
      }
      setMessage(result.message ?? "Password updated.");
      event.currentTarget.reset();
    } catch {
      setError("The account service is temporarily unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="brand auth-brand">
          <span className="brand-mark"><Factory size={22} /></span>
          <div><strong>SAP World</strong><span>Enterprise Simulation Cloud</span></div>
        </div>
        <div className="auth-copy">
          <span className="auth-kicker">Secure account recovery</span>
          <h1>Return to your SAP learning workspace.</h1>
          <p>
            Recovery links are single use, expire after 30 minutes, and close
            all existing sessions when the password changes.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <span className="auth-icon"><LockKeyhole size={22} /></span>
          <div>
            <span className="section-kicker">Account security</span>
            <h2>Choose a new password</h2>
            <p>Use at least 10 characters with a letter and number.</p>
          </div>
          <label>
            New password
            <input name="password" type="password" autoComplete="new-password" required minLength={10} />
          </label>
          <label>
            Confirm password
            <input name="confirmation" type="password" autoComplete="new-password" required minLength={10} />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="primary-button auth-submit" disabled={submitting || Boolean(message)}>
            {submitting ? "Updating password..." : "Update password"}
          </button>
          <Link className="auth-mode" href="/">Return to SAP World sign in</Link>
        </form>
      </section>
    </main>
  );
}
