"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export default function SignUpPage() {
  const router=useRouter(); const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError(null);const r=await authClient.signUp.email({name,email,password});if(r.error)setError(r.error.message||"Unable to create account");else router.replace("/admin/onboarding");setLoading(false);}
  return <main className="min-h-screen flex items-center justify-center px-6"><form onSubmit={submit} className="w-full max-w-md space-y-4"><h1 className="text-2xl font-semibold">Create your workspace</h1><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border px-4 py-3"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border px-4 py-3"/><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border px-4 py-3"/>{error&&<p className="text-red-600">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-white">{loading?"Creating…":"Create account"}</button><Link href="/sign-in" className="block text-center text-purple-600">Already have an account?</Link></form></main>;
}
