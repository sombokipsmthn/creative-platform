"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(token ? null : "This reset link is missing its token.");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!token) return setError("This reset link is invalid or incomplete.");
    if (password !== confirmation) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setIsLoading(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    if (result.error) setError(result.error.message || "This reset link is invalid or expired.");
    else { setMessage("Your password has been reset. You can now sign in."); setPassword(""); setConfirmation(""); }
    setIsLoading(false);
  }

  return <form onSubmit={handleSubmit} className="">
    <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading || !token} placeholder="New password" className="" />
    <input type="password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={isLoading || !token} placeholder="Confirm new password" className="" />
    {message && <p className="">{message}</p>}
    {error && <p className="">{error}</p>}
    <button type="submit" disabled={isLoading || !token} className="">{isLoading ? "Resetting..." : "Reset password"}</button>
  </form>;
}

export default function ResetPasswordPage() {
  return <main className=""><div className=""><Link href="/sign-in" className="">← Back to sign in</Link><div className=""><h1 className="">Reset your password</h1><p className="">Choose a new password for your workspace.</p><Suspense fallback={<p className="">Loading reset link...</p>}><ResetPasswordForm /></Suspense></div></div></main>;
}
