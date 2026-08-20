"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <div className="
            mx-auto mb-5
            flex h-12 w-12
            items-center justify-center
            rounded-xl
            bg-purple-600
            text-white
            font-bold
          ">
            K
          </div>


          <h1 className="
            text-2xl
            font-semibold
            tracking-tight
            text-slate-900
            dark:text-white
          ">
            Create your workspace
          </h1>


          <p className="
            mt-2
            text-sm
            text-slate-500
            dark:text-zinc-400
          ">
            Join KIPSMTHN and build your creative business.
          </p>

        </div>


        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/auth"

          appearance={{
            elements: {

              rootBox:
                "w-full",

              card:
                "bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800",

              headerTitle:
                "hidden",

              headerSubtitle:
                "hidden",

              formButtonPrimary:
                "bg-purple-600 hover:bg-purple-700 rounded-xl",

              formFieldInput:
                "rounded-xl border-slate-200 dark:border-zinc-700",

              socialButtonsBlockButton:
                "rounded-xl",

              footerActionLink:
                "text-purple-600",

            },

            variables:{
              colorPrimary:"#6D28D9",
            }

          }}

        />

      </div>

    </main>
  );
}