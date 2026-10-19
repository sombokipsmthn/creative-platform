"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function safeDestination(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/auth";
}

function SignInContent() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function destination() {
    return safeDestination(typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("redirect"));
  }

  useEffect(() => {
    if (session?.user) router.replace(destination());
  }, [router, session]);

  async function handleEmailSignIn(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    const result = await authClient.signIn.email({ email, password, callbackURL: destination() });
    if (result.error) setError("We could not sign you in with those details.");
    else router.replace(destination());
    setIsLoading(false);
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError(null);
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: destination(),
      newUserCallbackURL: "/auth",
      errorCallbackURL: "/sign-in?error=oauth",
    });
    if (result.error) {
      setError("Google sign-in is currently unavailable. Check the provider configuration.");
      setIsLoading(false);
    }
  }

  async function handlePasskeySignIn() {
    setIsLoading(true);
    setError(null);
    const result = await authClient.signIn.passkey();
    if (result.error) {
      setError("No registered passkey could sign you in on this device.");
      setIsLoading(false);
    } else {
      router.replace(destination());
    }
  }

  if (isPending) return <main className="" />;

  return (
    <main className="">
      <div className="">
        <Link href="/" className="">← Go back</Link>
        <div className="">
          <div className=""><div className="">K</div><h1 className="">Welcome back</h1><p className="">Sign in to your creator workspace.</p></div>
          <div className="">
            <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className=""><span className="">G</span>Continue with Google</button>
            <button type="button" onClick={handlePasskeySignIn} disabled={isLoading || (typeof window !== "undefined" && !window.PublicKeyCredential)} className="">Sign in with a passkey</button>
          </div>
          <div className=""><span className="" />or continue with email<span className="" /></div>
          <form onSubmit={handleEmailSignIn} className="">
            <label className="block"><span className="">Email</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} className="" /></label>
            <label className="block"><span className="">Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} className="" /></label>
            <div className=""><Link href="/forgot-password" className="">Forgot password?</Link></div>
            {error && <div role="alert" className="">{error}</div>}
            {message && <div role="status" className="">{message}</div>}
            <button type="submit" disabled={isLoading} className="">{isLoading ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="">New to KIPSMTHN? <Link href="/sign-up" className="">Create your workspace</Link></p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="" />}>
      <SignInContent />
    </Suspense>
  );
}
