"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (result.error) {
      setError(result.error.message || "Unable to send the reset email.");
    } else {
      setMessage("If an account exists for that email, a reset link has been sent.");
    }
    setIsLoading(false);
  }

  return (
    <main className="">
      <div className="">
        <Link href="/sign-in" className="">← Back to sign in</Link>
        <div className="">
          <h1 className="">Forgot password?</h1>
          <p className="">Enter your email and we’ll send a secure reset link.</p>
          <form onSubmit={handleSubmit} className="">
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} placeholder="you@example.com" className="" />
            {message && <p className="">{message}</p>}
            {error && <p className="">{error}</p>}
            <button type="submit" disabled={isLoading} className="">{isLoading ? "Sending..." : "Send reset link"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
