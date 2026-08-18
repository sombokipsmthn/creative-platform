
"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl">
        {/* Branding / Intro */}
        <section className="hidden flex-1 flex-col justify-between px-12 py-12 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D28D9] text-sm font-bold text-white">
                K
              </div>

              <span className="text-sm font-semibold tracking-tight text-gray-950">
                KIPSMTHN
              </span>
            </div>

            <div className="mt-24 max-w-lg">
              <div className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-medium text-[#6D28D9]">
                Creator platform
              </div>

              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-gray-950">
                Build your creative business in one place.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-gray-500">
                Manage clients, projects, equipment, quotes, invoices, and
                your creative workflow from one clean workspace.
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Create your creator account to get started.
          </p>
        </section>

        {/* Sign up */}
        <section className="flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-[520px] lg:border-l lg:border-gray-100">
          <div className="w-full max-w-[400px]">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#6D28D9] text-sm font-bold text-white lg:hidden">
                K
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-gray-950 lg:mt-0">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Start building your creator workspace.
              </p>
            </div>

            <SignUp
              routing="hash"
              signInUrl="/sign-in"
              forceRedirectUrl="/admin/onboarding"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none border-0 p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "h-11 rounded-xl border border-gray-200 shadow-none hover:bg-gray-50",
                  formFieldInput:
                    "h-11 rounded-xl border-gray-200 shadow-none focus:border-[#6D28D9] focus:ring-2 focus:ring-purple-100",
                  formButtonPrimary:
                    "h-11 rounded-xl bg-[#6D28D9] shadow-none hover:bg-[#5B21B6]",
                  footerActionLink:
                    "text-[#6D28D9] hover:text-[#5B21B6]",
                  identityPreviewEditButton:
                    "text-[#6D28D9]",
                },
                variables: {
                  colorPrimary: "#6D28D9",
                },
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
