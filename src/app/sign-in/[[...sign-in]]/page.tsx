"use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Go back
        </button>


        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
         forceRedirectUrl="/auth"
        />

      </div>

    </main>
  );
}