"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await authClient.signUp.email({ name, email, password, callbackURL: "/auth" });
    if (result.error) setError(result.error.message || "We could not create your account.");
    else router.replace("/auth");
    setIsLoading(false);
  }

  async function handleGoogleSignUp() {
    setIsLoading(true);
    setError(null);
    const result = await authClient.signIn.social({ provider: "google", callbackURL: "/auth", newUserCallbackURL: "/auth", errorCallbackURL: "/sign-up?error=oauth" });
    if (result.error) {
      setError("Google sign-up is currently unavailable. Check the provider configuration.");
      setIsLoading(false);
    }
  }

  return (
    <main className="">
      <div className="">
        <Link href="/" className="">← Go back</Link>
        <div className="">
          <div className=""><div className="">K</div><h1 className="">Create your workspace</h1><p className="">Set up your creative business on KIPSMTHN.</p></div>
          <button type="button" onClick={handleGoogleSignUp} disabled={isLoading} className=""><span className="">G</span>Continue with Google</button>
          <div className=""><span className="" />or use email<span className="" /></div>
          <form onSubmit={handleSubmit} className="">
            <label className="block"><span className="">Name</span><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required disabled={isLoading} className="" /></label>
            <label className="block"><span className="">Email</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} className="" /></label>
            <label className="block"><span className="">Password</span><input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} className="" /><span className="block">Use at least 8 characters.</span></label>
            {error && <div role="alert" className="">{error}</div>}
            <button type="submit" disabled={isLoading} className="">{isLoading ? "Creating account…" : "Create account"}</button>
          </form>
          <p className="">Already have an account? <Link href="/sign-in" className="">Sign in</Link></p>
        </div>
      </div>
    </main>
  );
}
